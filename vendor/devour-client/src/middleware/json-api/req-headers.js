import _ from 'lodash'

export default {
  name: 'HEADER',
  req: (payload) => {
    if (!_.isEmpty(payload.jsonApi.headers)) {
      payload.req.headers = _.assign({}, payload.req.headers, payload.jsonApi.headers)
    }
    return payload
  }
}
