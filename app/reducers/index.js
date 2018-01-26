// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import explain from './home';

const rootReducer = combineReducers({
  explain,
  router,
});

export default rootReducer;
