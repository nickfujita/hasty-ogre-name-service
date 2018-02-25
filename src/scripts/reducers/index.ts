import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import neo from './components/neo';

const rootReducer = combineReducers({
  routing: routerReducer,
  neo,
});

export default rootReducer;
