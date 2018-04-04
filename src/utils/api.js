import { normalize, schema } from 'normalizr'

// export const base_url = 'https://mobile-app.inspector-cloud-staging.ru/api/v1.5'
// export const base_url = 'https://pepsico.inspector-cloud.ru/api/v1.5'
export const base_url = 'https://delikateses.inspector-cloud.ru/api/v1.5'

export const visitSchema = new schema.Entity('visit')

export const Schemas = {
  VISIT: visitSchema,
  VISIT_ARRAY: [visitSchema]
}

export const getParameterByName = (name, url) => {
  if (!url) {
    return null
  }
  name = name.replace(/[\[\]]/g, '\\$&')
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url)
  if (!results)
    return null
  if (!results[2])
    return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}