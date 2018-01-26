// @flow
import type { stateType } from '../reducers/home';

type actionType = {
  +type: string,
  +type: string
};

export const QUERY_WORD= 'QUERY_WORD';

export function query(word) {
  return {
    type: QUERY_WORD,
    word
  };
}


export function queryAsync(word, delay: number = 2000) {
  return (dispatch: (action: actionType) => void) => {
    setTimeout(() => {
      dispatch(query(word));
    }, delay);
  };
}
