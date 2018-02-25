import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from './reducers';

export default function configureStore(initialState?) {

  const middleware = [
    thunk,
    logger,
  ];

  const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

  const store = createStoreWithMiddleware(rootReducer, initialState);

  return store;
}
