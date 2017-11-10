export default {
  name: 'axios-request',
  req: function (payload) {
    let jsonApi = payload.jsonApi
    return jsonApi.axios(payload.req)
  }
}
