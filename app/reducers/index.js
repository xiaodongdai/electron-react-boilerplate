// @flow
"use strict"

import {
  combineReducers
} from 'redux'
import {
  routerReducer as router
} from 'react-router-redux'
import {
  wordInfo,
  wordList,
  wordListDisplay,
  curState,
  reviewInfo
} from './reducers'
import {
  START_REVIEW,
  ADD_WORD,
  WORD_KNOW,
  WORD_DONTKNOW,
  SORT_WORDS
} from '../actions/actions'


export function sortWords(a, b) {
  if (!a.cefr || a.cefr === '') {
    a.cefr = 'D3'
  }
  if (!b.cefr || b.cefr === '') {
    b.cefr = 'D3'
  }

  if (a.cefr !== b.cefr) {
    return a.cefr < b.cefr ? -1 : 1
  }
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

let memo
function fibonacci(num, memo) {
  memo = memo || {}

  if (memo[num]) return memo[num]
  if (num <= 1) return 1

  return memo[num] = fibonacci(num - 1, memo) + fibonacci(num - 2, memo)
}

const startReview = (state, action) => {
  const wordListReview = []
  state.wordList.slice(0).sort(sortWords).filter((word, idx) => idx < 30 && word.nextReviewAt < Date.now()).forEach(w => {
    const {
      word,
      index
    } = w
    wordListReview.push({
      word,
      index,
      isFirstTime: true,
      isReviewed: false
    })
  })

  if (wordListReview.length === 0) {
    return state
  }
  console.log('reducer: reviewWords:  ', wordListReview)
  const reviewInfo = {
    wordListReview,
    show: false,
    curReviewIndex: 0
  }
  const newState = Object.assign({ ...state }, {
    reviewInfo,
    curState: 'review'
  })
  return newState
}

const getUnknownIndexes = (wordListReview, curReviewIndex) => {
  for (let i = 0; i <= curReviewIndex; i += 1) {
    if (wordListReview[i].isReviewed === false) {
      unknownIndex.push(i)
    }
  }
}

const wordDontKnow = (state, action) => {
  const wordListReview = state.reviewInfo.wordList.slice(0)
  let curReviewIndex = state.reviewInfo.curReviewIndex
  const wordInReview = wordListReview[curReviewIndex]
  const wordList = state.wordList.slice(0)
  const curState = state.curState

  if (wordInReview.isFirstTime === true) {
    wordInReview.isFirstTime = false
    const word = wordList[wordInReview.index]
    // set the iterations.
    word.reviewedTimes = 0
    // set next review time.
    const nextDate = new Date()
    word.nextReviewAt = nextDate.setDate(nextDate.getDate() + 1)
  }

  const unknownIndexes = getUnknownIndexes(wordListReview, curReviewIndex)
  if (unknownIndexes.length() > 0) {
    // it is last one or there are more than 5 unknown words.
    if (curReviewIndex === wordListReview.length() - 1 ||
      unknownIndexes.length() >= 5) {
      curReviewIndex = unknownIndexes[0]
    }
  }

  const reviewInfo = {
    ...reviewInfo,
    curReviewIndex
  }
  return {
    ...state,
    wordList,
    reviewInfo
  }
}

const wordKnow = (state, action) => {
  const wordListReview = state.reviewInfo.wordListReview.slice(0)
  let curReviewIndex = state.reviewInfo.curReviewIndex
  const wordInReview = wordListReview[curReviewIndex]
  const wordList = state.wordList.slice(0)
  let curState = state.curState
  wordInReview.isReviewed = true
  console.log('wordListReview', wordListReview)
  console.log('curReviewIndex'+ curReviewIndex)
  while (curReviewIndex < wordListReview.length && wordListReview[curReviewIndex].isReviewed === true) {
    curReviewIndex += 1
  }

  let reviewInfo = null
  console.log(`curReviewIndex:  ${curReviewIndex}, ${wordListReview.length}`)
  if (curReviewIndex >= wordListReview.length) {
    // TODO make a message box.
    reviewInfo = {}
    curState = 'dictionary'
  } else {
    reviewInfo = {
      ...state.reviewInfo,
      wordListReview,
      curReviewIndex
    }
  }

  // if it is the first time reivew, we update the next review time.
  if (wordInReview.isFirstTime === true) {
    wordInReview.isFirstTime = false
    const word = wordList[wordInReview.index]
    // set the iterations.
    word.reviewedTimes = word.reviewedTimes || 0
    word.reviewedTimes += 1
    // set next review time.
    const nextDate = new Date()
    console.log('reviewedTimes:  ' + word.reviewedTimes)
    const days = fibonacci(word.reviewedTimes)

    word.nextReviewAt = nextDate.setDate(nextDate.getDate() + days)
  }
  return {
    ...state,
    curState,
    wordList,
    reviewInfo
  }
}

const rootReducer = (state, action) => {
  switch (action.type) {
    case WORD_KNOW:
      // if it is the first time for showing the word today, then reset the reviewAt value.
      return wordKnow(state, action)
    case WORD_DONTKNOW: 
      return wordDontKnow(state, action)
    case START_REVIEW:
      return startReview(state, action)

    case ADD_WORD:
    {
      const wordList = state.wordList.slice(0)
      const index = state.wordList.length
      wordList.push({
        word: action.word,
        index,
        cefr: action.cefr,
        freq: action.freq,
        rank: action.rank,
        addedAt: action.addedAt,
        nextReviewAt: action.nextReviewAt,
        reviewedTimes: 0,
        userComments: action.userComments
      })
      let wordListDisplay = state.wordListDisplay.slice(0)
      wordListDisplay.push({
        word: action.word,
        index
      })
      return {
        ...state,
        wordList,
        wordListDisplay
      }
    }

    case SORT_WORDS:
      let wordListDisplay = state.wordListDisplay.slice(0)
      console.log('unsorted wordListDisplay', wordListDisplay)
      wordListDisplay.sort((a, b) => sortWords(state.wordList[a.index], state.wordList[b.index]))
      console.log('sorted wordListDisplay:', wordListDisplay)
      return Object.assign({ ...state }, {
        wordListDisplay
      })
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
})

export default rootReducer
