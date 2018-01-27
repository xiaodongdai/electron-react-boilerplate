// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import {explain, rankInfo, wordList} from './home'

const rootReducer = combineReducers({
  explain,
  rankInfo,
  wordList,
  router,
});

export default rootReducer;
