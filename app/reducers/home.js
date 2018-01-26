// @flow
import { QUERY_WORD } from '../actions/home';

export type stateType = {
  +explain:  string
};

type actionType = {
  +type: string,
  +type: string
};

export default function explain(state: string = '', action: actionType) {
  switch (action.type) {
    case QUERY_WORD:
      console.log('reducer: explain!', action)
      setTimeout(() => '')
      return `got it ${action.word}`
    default:
      return state;
  }
}
