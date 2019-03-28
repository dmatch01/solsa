const callSites = require('callsites')
const Events = require('events')
const needle = require('needle')
const pkgDir = require('pkg-dir')

const PORT = 8080

function genLabels (svc) {
  return {
    'solsa.ibm.com/name': svc.name
  }
}

function solsaImage (str) {
  return 'solsa-' + str.toLowerCase()
}

global.__level = global.__level || 0

let solsa = {
  Service: class Service {
    static make () {
      // console.log(' '.repeat(global.__level) + 'make', this.name)
      if (!global.__yaml && global.__level) return null
      global.__level++
      let svc = new this(...arguments)
      global.__level--
      svc.solsa.options.push(...arguments)
      if (svc.solsa.raw || global.__yaml) return svc

      for (let key of Object.getOwnPropertyNames(svc.constructor.prototype).filter(name => name !== 'constructor')) {
        svc[key] = async function () {
          return needle('post', (process.env.SOLSA_URL || `http://${svc.name}:${PORT}`) + '/' + key, arguments[0], { json: true })
            .then(result => result.body)
        }
      }

      for (let event of svc.events.eventNames()) {
        svc.events.removeAllListeners(event)
        svc.events.on(event, function () {
          needle('post', (process.env.SOLSA_URL || `http://${svc.name}:${PORT}`) + '/' + event, arguments[0], { json: true })
        })
      }

      return svc
    }

    constructor (name, raw) {
      // console.log(' '.repeat(global.__level) + 'new', this.constructor.name)
      this.name = name
      this.events = new Events()
      this.solsa = { raw, serviceReady: false, dependencies: [], secrets: {}, options: [], file: callSites()[1].getFileName() }
    }

    async initializeService () {
      this.serviceReady = true
    }

    addDependency (dep) {
      if (dep) {
        this.solsa.dependencies.push(dep)
        dep.solsa.parent = this
      }
      return dep
    }

    addSecret (name, key) {
      let v = `SOLSA_${name}_SOLSA_${key}`.toUpperCase().replace(/-/g, '_')
      this.solsa.secrets[v] = { valueFrom: { secretKeyRef: { name, key } } }
      return process.env[v]
    }

    _images () {
      if (this.solsa.raw) return {}
      const me = {}
      me[this.constructor.name] = { name: solsaImage(this.constructor.name), dir: pkgDir.sync(this.solsa.file) }
      return Object.assign(me, ...this.solsa.dependencies.filter(svc => svc._images).map(svc => svc._images()))
    }

    async _yaml (archive) {
      let env = { SOLSA_OPTIONS: { value: JSON.stringify(this.solsa.options) } }
      for (let svc of this.solsa.dependencies) {
        await svc._yaml(archive)
        for (let k of Object.keys(svc.solsa.secrets)) {
          env[k] = svc.solsa.secrets[k]
        }
      }

      if (Object.getOwnPropertyNames(this.constructor.prototype).filter(name => name !== 'constructor').length === 0) return

      const deployment = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: this.name,
          labels: genLabels(this)
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: genLabels(this)
          },
          template: {
            metadata: {
              labels: genLabels(this)
            },
            spec: {
              containers: [{
                name: this.name,
                image: solsaImage(this.constructor.name),
                ports: [{ name: 'solsa', containerPort: PORT }],
                env: Object.keys(env).map(key => Object.assign({ name: key }, env[key])),
                livenessProbe: {
                  tcpSocket: {
                    port: PORT
                  }
                },
                readinessProbe: {
                  httpGet: {
                    path: '/solsa/readinessProbe',
                    port: PORT
                  }
                }
              }]
            }
          }
        }
      }
      archive.addYaml(deployment, this.name + '-deployment.yaml', 'kubernetes')

      const svc = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: this.name,
          labels: genLabels(this)
        },
        spec: {
          type: 'ClusterIP',
          ports: [{ name: 'solsa', port: PORT }],
          selector: genLabels(this)
        }
      }
      archive.addYaml(svc, this.name + '-svc.yaml', 'kubernetes')

      const ksvc = {
        apiVersion: 'serving.knative.dev/v1alpha1',
        kind: 'Service',
        metadata: {
          name: this.name
        },
        spec: {
          runLatest: {
            configuration: {
              revisionTemplate: {
                spec: {
                  container: {
                    image: solsaImage(this.constructor.name),
                    env: Object.keys(env).map(key => Object.assign({ name: key }, env[key]))
                  }
                }
              }
            }
          }
        }
      }
      archive.addYaml(ksvc, this.name + '-svc.yaml', 'knative')
    }

    static serve () {
      let options = JSON.parse(process.env.SOLSA_OPTIONS || '[]')

      let svc = new this(...options)

      svc.initializeService()

      let express = require('express')
      let app = express()
      app.use(express.json())

      for (let key of Object.getOwnPropertyNames(this.prototype).filter(name => name !== 'constructor')) {
        app.post('/' + key, (request, response) => {
          Promise.resolve().then(() => svc[key](request.body)).then(r => response.send(r), err => response.status(500).send((err && err.message) || 'Internal error'))
        })
      }

      for (let key of svc.events.eventNames()) {
        app.post('/' + key, (request, response) => {
          Promise.resolve().then(() => svc.events.emit(key, request.body)).then(() => response.status(200).send('OK'), err => response.status(500).send((err && err.message) || 'Internal error'))
        })
      }

      app.get('/solsa/readinessProbe', (_request, response) => {
        if (svc.serviceReady) {
          response.status(200).send('OK')
        } else {
          response.status(503).send('Service not ready')
        }
      })

      app.post('/', (request, response) => {
        Promise.resolve().then(() => {
          let Body = JSON.parse(request.body.Body)
          svc.events.emit(Body.event, Body.payload)
        }).then(() => response.status(200).send('OK'), err => response.status(500).send((err && err.message) || 'Internal error'))
      })

      app.listen(PORT, err => {
        if (err) {
          console.error(err)
        } else {
          console.log(`server is listening on ${PORT}`)
        }
      })
    }
  }
}

module.exports = solsa
