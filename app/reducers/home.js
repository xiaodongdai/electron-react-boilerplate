// @flow
import { GET_EXPLAIN, GET_CEFR } from '../actions/home';

export type stateType = {
  +explain:  string,
  +frequency: int,
  +cefr:     string
};

type actionType = {
  +type: string,
  +type: string
};

export function explain(state: string = '', action: actionType) {
  switch (action.type) {
    case GET_EXPLAIN:
      console.log('reducer: explain!', action)
      return `${action.explain}`
    default:
      return state;
  }
}

export function cefr(state: string = '', action: actionType) {
  switch (action.type) {
    case GET_CEFR:
      console.log('reducer: cefr!', action)
      return `${action.cefr}`
    default:
      return state;
  }
}
