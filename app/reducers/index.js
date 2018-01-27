// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import {explain, cefr} from './home';

const rootReducer = combineReducers({
  explain,
  cefr,
  router,
});

export default rootReducer;
