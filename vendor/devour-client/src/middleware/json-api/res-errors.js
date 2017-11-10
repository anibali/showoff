import Logger from '../../logger'

function buildErrors (serverErrors) {
  if (!serverErrors) {
    Logger.error('Unidentified error')
    return
  } else {
    let errors = {}
    for (let [index, error] of serverErrors.errors.entries()) {
      errors[errorKey(index, error.source)] = { title: error.title, detail: error.detail }
    }
    return errors
  }
}

function errorKey (index, source) {
  if (source.pointer == null) {
    return index
  }
  return source.pointer.split('/').pop()
}

export default {
  name: 'errors',
  error: function (payload) {
    return buildErrors(payload.response.data)
  }
}
