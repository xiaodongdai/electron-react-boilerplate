// @flow
import { RETRIVED_WORDINFO } from '../actions/actions'

export type stateType = {
  +curState: string,
  +wordListDisplay: array,
  +wordList: array,
  +wordInfo: object,
  +reviewInfo: object
};

type actionType = {
  +type: string,
  +type: string
};

export function curState(state: string = '', action: actionType) {
  return state
}


export function wordInfo(state: object = {}, action: actionType) {
  switch (action.type) {
    case RETRIVED_WORDINFO:
      return {
        ...state,
        explain: action.explain,
        cefr: action.cefr,
        rank: action.rank,
        freq: action.freq,
      }
    default:
      return state
  }
}


export function wordListDisplay(state: array = [], action: actionType) {
  return state
}

export function wordList(state: array = [], action: actionType) {
  return state
}

export function reviewInfo(state: array = [], action: actionType) {
  return state
}
