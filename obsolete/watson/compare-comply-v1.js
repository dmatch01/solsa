// Autogenerated. DO NOT MODIFY

const solsa = require('../solsa')
const _CompareComplyV1 = require('watson-developer-cloud/compare-comply/v1')

class CompareComplyV1 extends solsa.Service {
  constructor (name) {
    super(name, true)

    this.url = this.addSecret(`binding-${name}`, 'url')
    this.apikey = this.addSecret(`binding-${name}`, 'apikey')
  }
  async convertToHtml (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.convertToHtml(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
  async classifyElements (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.classifyElements(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
  async extractTables (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.extractTables(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
  async compareDocuments (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.compareDocuments(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
  async listFeedback (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.listFeedback(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
  async addFeedback (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.addFeedback(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
  async getFeedback (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.getFeedback(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
  async deleteFeedback (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.deleteFeedback(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
  async listBatches (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.listBatches(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
  async createBatch (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.createBatch(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
  async getBatch (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.getBatch(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
  async updateBatch (params) {
    return new Promise((resolve, reject) => {
      if (this.delegate === undefined) {
        this.delegate = new _CompareComplyV1({ version: '2018-05-01', iam_apikey: this.apikey, url: this.url })
      }
      this.delegate.updateBatch(params, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }

  _yaml (archive) {
    const svc = {
      apiVersion: 'ibmcloud.seed.ibm.com/v1beta1',
      kind: 'Service',
      metadata: {
        name: this.name
      },
      spec: {
        service: 'compare-comply',
        plan: 'lite-ga',
        servicetype: 'IAM'
      }
    }
    archive.addResource(svc, this.name + '-svc.yaml')
    const binding = {
      apiVersion: 'ibmcloud.seed.ibm.com/v1beta1',
      kind: 'Binding',
      metadata: {
        name: `binding-${this.name}`
      },
      spec: {
        bindingFrom: {
          name: this.name
        },
        servicetype: 'IAM'
      }
    }
    archive.addResource(binding, this.name + '-binding.yaml')
  }
}

module.exports = CompareComplyV1