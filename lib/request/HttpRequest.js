'use strict'

const Request = require('./Request')
const request = require('request-promise')
const _ = require('lodash')

/**
 * Requester for all calls
 * @type {ErisDB.HttpRequest}
 */
module.exports = class HttpRequest extends Request {

  /**
   * Handle RPC response
   * @param {Object} response
   * @return {Promise}
   */
  transformResponse (response) {
    if (!_.isObject(response))
      return Promise.reject(new Error('Wrong RPC response'))

    if (response.error)
      return Promise.reject(_.isString(response.error) ? new Error(response.error) : response.error)

    if (_.isUndefined(response.result))
      return Promise.reject(new Error('Wrong RPC response'))

    return Promise.resolve(response.result)
  }

  /**
   * Makes a call to RPC
   * @param {String} method
   * @param {Object} [params]
   * @return {Promise}
   */
  call (method, params) {
    if (!_.isString(method))
      return Promise.reject(new Error('Please provide RPC method name'))
    // no need to repeat it
    method = method.replace('erisdb.', '')
    //
    const options = {
      method: 'POST',
      uri: this.url,
      json: true,
      body: _.defaults({
        jsonrpc: '2.0',
        method: `erisdb.${method}`
      }, { params: params || {} })
    }
    return request(options)
      .then(this.transformResponse)
  }
}
