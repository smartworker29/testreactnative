import {init} from '../../../src/reducer/visitDetails'
import state from '../../../src/reducer/visitDetails'
import {GET_VISIT_DETAILS_ERROR, GET_VISIT_DETAILS_REQUEST} from '../../../src/utils/constants'

describe(`action ${GET_VISIT_DETAILS_REQUEST}`, () => {
  it(`isFetch expect to be true`, () => {
    expect(state(init, {type: GET_VISIT_DETAILS_REQUEST}).isFetch).toBeTruthy()
  })

  it(`error expect to be null`, () => {
    expect(state(init, {type: GET_VISIT_DETAILS_REQUEST}).error).toBeNull()
  })
})

describe(`action ${GET_VISIT_DETAILS_ERROR}`, () => {
  it(`isFetch expect to be false`, () => {
    expect(state({isFetch: true}, {type: GET_VISIT_DETAILS_ERROR}).isFetch).toBeFalsy()
  })

  it(`error expect to be null`, () => {
    expect(state(init, {type: GET_VISIT_DETAILS_ERROR}).error).toBeNull()
  })
})
