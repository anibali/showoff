import _ from 'lodash'

export default {
  name: 'HTTP_BASIC_AUTH',
  req: (payload) => {
    if (!_.isEmpty(payload.jsonApi.auth)) {
      payload.req.auth = payload.jsonApi.auth
    }
    return payload
  }
}
