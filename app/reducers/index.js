// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import {wordInfo, wordList, wordListDisplay, curState, reviewInfo} from './reducers'
import {START_REVIEW, ADD_WORD, WORD_KNOW, WORD_DONTKNOW, SORT_WORDS} from '../actions/actions'


export function sortWords(a,b) {
    if (!a.cefr || a.cefr === '') {
      a.cefr = 'D3'
    } 
    if (!b.cefr || b.cefr === '') {
      b.cefr = 'D3'
    }

    if (a.cefr !== b.cefr) {
      return a.cefr < b.cefr ? -1 : 1
    }
    else {
      if (!a.rank) {
        a.rank = 1000000
      }
      if (!b.rank) {
        b.rank = 1000000
      }
      if (a.rank !== b.rank) {
        return a.rank < b.rank ? -1 : 1
      }
    }
  }


function fibonacci(num, memo) {
  memo = memo || {};

  if (memo[num]) return memo[num];
  if (num <= 1) return 1;

  return memo[num] = fibonacci(num - 1, memo) + fibonacci(num - 2, memo);
}

const startReview = (state, action) => {
  let wordListReview = []
  state.wordList.slice(0).sort(sortWords).filter((word, idx) => {
    return idx < 30 && word.nextReviewAt < Date.now()
  }).forEach(w => {
    let {word, index} = w
    wordListReview.push({
      word,
      index,
      isFirstTime: true,
      isReviewed:    false
    })
  })

  console.log('reducer: reviewWords :', reviewWords)
  let reviewInfo = {
    wordListReview,
    show: false, 
    curReviewIndex: 0
  }
  let newState = Object.assign({...state}, {reviewInfo, curState: 'review'})
  return newState
}


const wordKnow = (state, action) => {
  let wordListReview = state.reviewInfo.wordList.slice(0)
  let curReviewIndex = state.reviewInfo.curReviewIndex
  let wordInReview = wordListReview[curReviewIndex]
  let wordList = state.wordList.slice(0)
  let curState = state.curState
  wordInReview.isReviewed = true
  if(wordInReview.isFirstTime === true) {
    wordInReview.isFirstTime = false
  }

  while (wordListReview[curReviewIndex].isReviewed === true && curReviewIndex < wordListReview.length()) {
    curReviewIndex += 1
  }

  let reviewInfo = null
  if (curReviewIndex === wordInReview.length()) {
    // TODO make a message box.
    reviewInfo = {}
    curState = 'dictionary'
  } else {
    reviewInfo = {...state.reviewInfo, wordListReview, curReviewIndex}
  }

  // if it is the first time reivew, we update the next review time.
  if(wordInReview.isFirstTime === true) {
    let word = wordList[wordInReview.index]
    // set the iterations.
    word.reviewedTimes += 1
    // set next review time.
    let nextDate = new Date()
    let days = fibonacci(word.reviewedTimes)
    word.nextReviewAt = nextDate.setDate(nextDate.getDate() + days)
  }
  return {...state, wordList, reviewInfo}
}





const rootReducer = (state, action) => {
    switch (action.type) {
      case WORD_KNOW:
        // if it is the first time for showing the word today, then reset the reviewAt value.
        return state
      case START_REVIEW:
        return startReview(state, action)

      case ADD_WORD:
        let wordList = state.wordList.slice(0)
        let index = state.wordList.length()
        wordList.push({
          word: action.word, 
          index,
          cefr: action.cefr,
          freq: action.freq,
          rank: action.rank,
          addedAt: action.addedAt,
          nextReviewAt: action.nextReviewAt,
          userComments: action.userComments
        })
        wordListDisplay = state.wordListDisplay.slice(0)
        wordListDisplay.push({
          word: action.word,
          index
        })
        return {...state, wordList, wordListDisplay}

        case SORT_WORDS:
          let wordListDisplay = state.wordListDisplay.slice(0)
          console.log('unsorted wordListDisplay', wordListDisplay)
          wordListDisplay.sort((a, b) => sortWords(state.wordList[a.index], state.wordList[b.index]))
          console.log('sorted wordListDisplay:', wordListDisplay)
          return Object.assign({...state}, {wordListDisplay})
            // make 
      default:
        return rootReducerHelper(state, action)
    }
}

const rootReducerHelper = combineReducers({
  wordList,
  wordListDisplay,
  wordInfo,
  curState,
  reviewInfo,
  router,
});

export default rootReducer;
