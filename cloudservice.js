const solsa = require('./solsa')

let cloudservice = {
  CloudService: class CloudService extends solsa.Service {
    constructor (name, spec) {
      super(name)
      this.name = name
      this.spec = spec
    }

    _yaml (archive) {
      let ret = {}
      ret.apiVersion = 'ibmcloud.seed.ibm.com/v1beta1'
      ret.kind = 'Service'
      ret.metadata = { name: this.name }
      ret.spec = this.spec
      archive.addResource(ret, this.name + '-cloudservice.yaml')
    }
  }
}

cloudservice.MessageHub = class MessageHub extends solsa.Service {
  constructor (name) {
    super(name)
    this.addDependency(new cloudservice.CloudService(name, { service: 'messagehub', plan: 'standard' }))
    this.topicCount = 0
  }

  addTopic (name, configs) {
    let topicName = this.name + '-topic-' + this.topicCount
    this.topicCount += 1
    this.addDependency(new cloudservice.Topic(topicName, name, this.name, configs))
  }
}

cloudservice.Topic = class Topic extends solsa.Service {
  constructor (internalName, externalName, messagehubName, configs) {
    super(internalName)
    this.internalName = internalName
    this.externalName = externalName
    this.messagehubName = messagehubName
    this.configs = configs
  }

  _yaml (archive) {
    let ret = {}
    ret.apiVersion = 'messagehub.seed.ibm.com/v1beta1'
    ret.kind = 'Topic'
    ret.metadata = { name: this.internalName }
    ret.spec = {
      messageHubName: this.messagehubName,
      bindingFrom: {
        name: 'binding-' + this.messagehubName
      },
      topicName: this.externalName,
      numPartitions: this.configs.numPartitions,
      replicationFactor: this.configs.replicationFactor,
      configs: this.configs.configs
    }
    archive.addResource(ret, this.name + '-topic.yaml')
  }
}

cloudservice.StreamingAnalytics = class StreamingAnalytics extends solsa.Service {
  constructor (name) {
    super(name)
    this.addDependency(new cloudservice.CloudService(name, { service: 'streaming-analytics', plan: 'entry-container-hourly', servicetype: 'IAM' }))
  }
}

cloudservice.Redis = class Redis extends solsa.Service {
  constructor (name) {
    super(name)
    this.addDependency(new cloudservice.CloudService(name, { service: 'compose-for-redis', plan: 'Standard', parameters: [{ name: 'tls', value: 'false' }] }))
  }
}

cloudservice.getSecretRef = function (key, service) {
  return {
    secretKeyRef: {
      name: 'binding-' + service,
      key: key
    }
  }
}

cloudservice.getValueFromBinding = function (key, service) {
  return {
    name: key,
    valueFrom: cloudservice.getSecretRef(key, service)
  }
}

module.exports = cloudservice