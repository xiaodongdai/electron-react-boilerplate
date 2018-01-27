// @flow
import { RETRIVED_EXPLAIN, RETRIVED_RANK, ADD_WORD, SORT_WORDS } from '../actions/home';

export type stateType = {
  +explain:  string,
  +frequency: int,
  +cefr:     object,
  +wordList: array
};

type actionType = {
  +type: string,
  +type: string
};

export function explain(state: string = '', action: actionType) {
  switch (action.type) {
    case RETRIVED_EXPLAIN:
      console.log('reducer: explain!', action)
      return `${action.explain}`
    default:
      return state;
  }
}

export function rankInfo(state: object = {}, action: actionType) {
  switch (action.type) {
    case RETRIVED_RANK:
      console.log('reducer: cefr!', action)
      return action.rankInfo
    default:
      return state;
  }
}

export function wordList(state: array = [], action: actionType) {
  var newState = null
  let sortFunc = (a,b) => {
    if (!a.cefr || cefr === '') {
      a.cefr = 'D3'
    } 
    if (!b.cefr || cefr === '') {
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
  switch (action.type) {

    case ADD_WORD:
      console.log('reducer: wordList called', state)
      newState = state.slice(0)
      newState.push({word: action.word, ...action.rankInfo})
      return newState
    case SORT_WORDS:
      console.log('reducer: sort words', state)
      console.log('STATE',state)
      newState = state.slice(0)
      newState.sort(sortFunc)
      console.log('newState',newState)
      return newState
    default:
      return state;
  }
}