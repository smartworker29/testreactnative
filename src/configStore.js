import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import rootReducer from './reducer'
import { middleware } from './utils/redux'



const logger = createLogger({
  predicate: (getState, action) => __DEV__,
  collapsed: true,
  duration: true,
})

const middlewares = [
  applyMiddleware(thunkMiddleware),
]
middlewares.push(applyMiddleware(middleware))
if (__DEV__) {
  middlewares.push(applyMiddleware(logger))
}
export const configureStore = () => {

  const store = compose(
    ...middlewares
  )(createStore)(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )

  return store
}


/*
const middlewares = [
  applyMiddleware(thunkMiddleware),
]
middlewares.push(applyMiddleware(middleware))

export const configureStore = () => {

  const store = compose(
    ...middlewares
  )(createStore)(rootReducer)

  return store
}

*/
