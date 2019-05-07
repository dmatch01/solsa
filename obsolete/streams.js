let needle = require('needle')
let solsa = require('./solsa')

// FIXME: Streams.knative limitation -- must be in same namespace as the Streams.knative controller pod
//        So we hardwire that in the yaml and also hardwire a cross-NS service reference in all needle
//        calls from the wrapper service to the service in the streams NS that wraps the StreamsJob
const StreamsKnativeNS = 'streams'

let streams = {
  StreamsJob: class StreamsJob extends solsa.Service {
    constructor (name, sab, submissionTimeValues) {
      super(name, true)
      this.name = name
      this.sab = sab
      this.submissionTimeValues = submissionTimeValues
      this.initialized = false
    }

    async _ensureInit () {
      if (this.initialized === false) {
        const opList = await this._retryingListOperators()
        for (let op of opList) {
          console.log('initializing ' + op)
          this[op] = async function () {
            const url = `http://${this.name}-svc` + '.' + StreamsKnativeNS + ':' + this.port + '/operator/' + op
            console.log('invoking StreamsJob: ' + url + ' ' + JSON.stringify(arguments[0]))
            return needle('put', url, arguments[0], { json: true })
              .then(result => result.body)
          }
        }
        this.initialized = true
      }
    }

    async _retryingListOperators () {
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
      while (true) {
        try {
          return await this._listOperators()
        } catch (err) {
          console.log('_retryingListOperators: StreamsJob not ready; waiting 1 second')
          await delay(1000)
        }
      }
    }

    async _listOperators () {
      const url = `http://${this.name}-svc` + '.' + StreamsKnativeNS + ':' + this.port + '/list'
      console.log('listOperators: ' + url)
      return needle('get', url, { json: true })
        .then(result => result.body.operators)
    }

    _yaml (archive) {
      const j = {
        apiVersion: 'streams.ibm.com/v1alpha1',
        kind: 'Job',
        metadata: {
          name: this.name,
          namespace: StreamsKnativeNS
        },
        spec: {
          fusion: {
            manual: 1
          },
          processingElement: {
            imagePullPolicy: 'Always',
            runtimeTraceLevel: 'DEBUG',
            sabName: this.sab,
            restartFailedPod: true
          },
          submissionTimeValues: this.submissionTimeValues
        }
      }
      archive.addResource(j, this.name + '-job.yaml')

      const svc = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: this.name + '-svc',
          namespace: StreamsKnativeNS
        },
        spec: {
          ports: [{ port: this.port }],
          selector: {
            app: 'streams',
            svc: 'pe'
          }
        }
      }
      archive.addResource(svc, this.name + '-svc.yaml')
    }
  }
}

module.exports = streams