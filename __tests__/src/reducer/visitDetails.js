import * as types from '../../../src/actions/visitDetails'
import {init} from '../../../src/reducer/visitDetails'
import state from '../../../src/reducer/visitDetails'


describe(`action ${types.GET_VISIT_DETAILS_REQUEST}`, () => {
    it(`isFetch expect to be true`, () => {
        expect(state(init, {type: types.GET_VISIT_DETAILS_REQUEST}).isFetch).toBeTruthy()

    })

    it(`error expect to be null`, () => {
        expect(state(init, {type: types.GET_VISIT_DETAILS_REQUEST}).error).toBeNull()

    })

})

describe(`action ${types.GET_VISIT_DETAILS_ERROR}`, () => {
    it(`isFetch expect to be false`, () => {

        expect(state({isFetch:true}, {type: types.GET_VISIT_DETAILS_ERROR}).isFetch).toBeFalsy()

    })

    it(`error expect to be null`, () => {
        expect(state(init, {type: types.GET_VISIT_DETAILS_ERROR}).error).toBeNull()

    })

})