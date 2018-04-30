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
  REMOVE_WORD,
  WORD_KNOW,
  WORD_DONTKNOW,
  SORT_WORDS,
  RETRIVED_WORDINFO,
  CHANGE_USER_COMMENTS

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
  state.wordList[action.language].slice(0).sort(sortWords)
    .filter(word => word.nextReviewAt < Date.now())
    .filter((word, idx) => idx < 30)
    .forEach(w => {
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

  console.log('reducer: reviewWords:    ', wordListReview)
  const reviewInfo = {
    wordListReview,
    show: false,
    curReviewIndex: 0,
    language: action.language
  }
  
  const newState = Object.assign({ ...state }, {
    reviewInfo,
    curState: 'review'
  })
  return newState
}

const getUnknownIndexes = (wordListReview, curReviewIndex) => {
  let unknownIndexes = []
  for (let i = 0; i <= curReviewIndex; i += 1) {
    if (wordListReview[i].isReviewed === false) {
      unknownIndexes.push(i)
    }
  }
  return unknownIndexes
}

// FIX ME: multiple languages support!
const wordDontKnow = (state, action) => {
  let language = action.language
  const wordListReview = state.reviewInfo.wordListReview.slice(0)
  let curReviewIndex = state.reviewInfo.curReviewIndex
  const wordInReview = wordListReview[curReviewIndex]
  const wordList = {}
  wordList[language] = state.wordList[language].slice(0)
  const curState = state.curState

  if (wordInReview.isFirstTime === true) {
    wordInReview.isFirstTime = false
    const word = wordList[language][wordInReview.index]
    // set the iterations.
    word.reviewedTimes = 0
    // set next review time.
    const nextDate = new Date()
    // we should review it as soon as we can , 0 day delay!!!
    word.nextReviewAt = nextDate.setDate(nextDate.getDate() + 0)
  }

  const unknownIndexes = getUnknownIndexes(wordListReview, curReviewIndex)
  if (unknownIndexes.length > 0) {
    // it is last one or there are more than 5 unknown words.
    if (curReviewIndex === wordListReview.length - 1 ||
      unknownIndexes.length >= 5) {
      curReviewIndex = unknownIndexes[0]
    } else {
      curReviewIndex += 1
    }
  }

  const reviewInfo = {
    ...state.reviewInfo,
    curReviewIndex,
    show: false
  }
  return {
    ...state,
    wordList: {...state.wordList, ...wordList},
    reviewInfo
  }
}

const wordKnow = (state, action) => {
  let language = action.language
  const wordListReview = state.reviewInfo.wordListReview.slice(0)
  let curReviewIndex = state.reviewInfo.curReviewIndex
  const wordInReview = wordListReview[curReviewIndex]
  const wordList = {}
  wordList[language] = state.wordList[language].slice(0)
  let curState = state.curState
  wordInReview.isReviewed = true
  console.log('wordListReview  ', wordListReview)
  console.log('curReviewIndex'+ curReviewIndex)
  while (curReviewIndex < wordListReview.length && wordListReview[curReviewIndex].isReviewed === true) {
    curReviewIndex += 1
  }

  let reviewInfo = null
  console.log(`curReviewIndex:   ${curReviewIndex}, ${wordListReview.length}`)
  if (curReviewIndex >= wordListReview.length) {
    // TODO make a message box, we are done!
    curState = 'dictionary'
  } else {
    reviewInfo = {
      ...state.reviewInfo,
      wordListReview,
      curReviewIndex,
      show: false
    }
  }

  // if it is the first time reivew, we update the next review time.
  if (wordInReview.isFirstTime === true) {
    wordInReview.isFirstTime = false
    const word = wordList[language][wordInReview.index]
    // set the iterations.
    word.reviewedTimes = word.reviewedTimes || 0
    word.reviewedTimes += 1
    // set next review time.
    const nextDate = new Date()
    console.log('reviewedTimes:    ' + word.reviewedTimes)
    const days = fibonacci(word.reviewedTimes)

    word.nextReviewAt = nextDate.setDate(nextDate.getDate() + days)
  }
  return {
    ...state,
    curState,
    wordList: {...state.wordList, ...wordList},
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
  case RETRIVED_WORDINFO:
  {
    let curState = action.review ? 'review':'dictionary'
    let reviewInfo = {...state.reviewInfo, show: action.review}
    //let wordInfo = wordInfo(state.wordInfo, action)
    let newWordInfo = wordInfo(state.wordInfo, action)

    for(let i=0; i<newWordInfo.explainations.length; i+=1) {
      let exp = newWordInfo.explainations[i]
      let language = exp.language
      let index = state.wordList[language].map(w => w.word).indexOf(newWordInfo.word)
      exp.isAdded = index !== -1
      if (index !== -1) {
        exp.userComments = state.wordList[language][index].userComments
      }
      
    }

    console.log('newWordInfo:=    ', newWordInfo)
    return {...state, curState, reviewInfo, wordInfo: newWordInfo}
  }

  case ADD_WORD:
  {
    let language = action.language
    const wordListLanguage = state.wordList[language].slice(0)
    const index = wordListLanguage.length
    wordListLanguage.push({
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

    let newWordList = {}
    newWordList[language] = wordListLanguage

    let wordList = {...state.wordList, ...newWordList}
    console.log('wordList:  ', wordList)

    // change isAdded property
    let explainations = state.wordInfo.explainations
    explainations.forEach(e => {
      if (e.language === language) {
        e.isAdded = true
      }
    })
    let wordInfo = {...state.wordInfo, explainations}
    return {
      ...state,
      wordList,
      wordInfo
    }
  }
  case REMOVE_WORD:
  {
    let language = action.language
    let word = action.word
    let index = state.wordList[language].map(w=>w.word).indexOf(word)
    if (index === -1) {
      console.log('cannot find word: ' + word)
      return state
    } else {
      const wordListLanguage = state.wordList[language].slice(0)
      wordListLanguage.splice(index, 1)
      let newWordList = {}
      newWordList[language] = wordListLanguage
      let wordList = {...state.wordList, ...newWordList}

      let explainations = state.wordInfo.explainations
      explainations.forEach(e => {
        if (e.language === language) {
          e.isAdded = false
        }
      })
      let wordInfo = {...state.wordInfo, explainations}
      return {
        ...state,
        wordList,
        wordInfo
      }
    }
  }
  case CHANGE_USER_COMMENTS:
  {
    let language = action.language
    let word = action.word
    let index = state.wordList[language].map(w=>w.word).indexOf(word)
    if (index === -1) {
      console.log('cannot find word: ' + word)
      return state
    } else {
      const wordListLanguage = state.wordList[language].slice(0)
      wordListLanguage[index].userComments = action.userComments
      let newWordList = {}
      newWordList[language] = wordListLanguage
      let wordList = {...state.wordList, ...newWordList}
      let explainations = state.wordInfo.explainations
      explainations.forEach(e => {
        if (e.language === language) {
          e.userComments = action.userComments
        }
      })
      let wordInfo = {...state.wordInfo, explainations}
      return {
        ...state,
        wordList,
        wordInfo
      }
    } 
  }

  case SORT_WORDS:
  {
    let wordListDisplay = state.wordListDisplay.slice(0)
    console.log('unsorted wordListDisplay', wordListDisplay)
    wordListDisplay.sort((a, b) => sortWords(state.wordList[a.index], state.wordList[b.index]))
    console.log('sorted wordListDisplay:', wordListDisplay)
    return Object.assign({ ...state }, {
      wordListDisplay
    })
  } // make
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
