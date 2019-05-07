const { addResource, Service } = require('../solsa')

function valueWrap (val) {
  if (val.valueFrom) return { valueFrom: val.valueFrom }
  if (val.value) return { value: val.value }
  return { value: val }
}

class ContainerizedService extends Service {
  constructor ({ name, image, env, ports }) {
    super()
    this.name = name
    this.image = image
    this.env = env || {}
    this.ports = ports || { http: 8080 }
  }

  getAllResources () {
    const resources = {}

    const env = []
    for (let key in this.env) {
      env.push(Object.assign({ name: key }, this.env[key]))
    }

    const ports = []
    for (let key in this.ports) {
      ports.push({ name: 'http1', containerPort: this.ports[key] })
    }

    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: this.name,
        labels: { 'solsa.ibm.com/name': this.name }
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: { 'solsa.ibm.com/name': this.name }
        },
        template: {
          metadata: {
            labels: { 'solsa.ibm.com/name': this.name }
          },
          spec: {
            containers: [{
              name: this.name,
              image: this.image,
              ports: ports,
              env: Object.keys(this.env).map(key => Object.assign({ name: key }, valueWrap(this.env[key])))
            }]
          }
        }
      }
    }
    addResource(resources, deployment, this.name + '-deployment.yaml', 'base')

    const svc = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: this.name,
        labels: { 'solsa.ibm.com/name': this.name }
      },
      spec: {
        type: 'ClusterIP',
        ports: ports,
        selector: { 'solsa.ibm.com/name': this.name }
      }
    }
    addResource(resources, svc, this.name + '-svc.yaml', 'base')

    return resources
  }

  getAllImages () {
    return [this.image]
  }
}

module.exports = { ContainerizedService }