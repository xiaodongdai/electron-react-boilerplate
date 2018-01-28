// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import {wordInfo, wordList, curState, reviewInfo, sortWords} from './reducers'
import {START_REVIEW} from '../actions/actions'

const rootReducer = (state, action) => {
    switch (action.type) {
      case START_REVIEW:
        console.log('START_REVIEW:    ', state)
        let reviewWords = state.wordList.slice(0).sort(sortWords)
        console.log('reducer: reviewWords:  ', reviewWords)
        reviewWords = reviewWords.filter((word, idx) => {
          return idx < 30 && word.nextReviewAt < Date.now()
        })
        console.log('reducer: reviewWords :', reviewWords)
        let reviewInfo = {
          show: false, 
          wordList: reviewWords, 
          curIndex: 0
        }

        let newState = Object.assign({...state}, {reviewInfo, curState: 'review'})
        
        console.log('newState', newState)
        return newState
        // make 
      default:
        return rootReducerHelper(state, action)
    }
}

const rootReducerHelper = combineReducers({
  wordList,
  wordInfo,
  curState,
  reviewInfo,
  router,
});

export default rootReducer;
