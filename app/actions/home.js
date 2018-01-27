// @flow
import type { stateType } from '../reducers/home'
import mdict from 'mdict'



type actionType = {
  +type: string,
  +type: string
};




export const GET_EXPLAIN= 'GET_EXPLAIN';
export const GET_CEFR = 'GET_CEFR'
export const ADD_FREQ = 'ADD_FREQ'

// load cefr file
let cefr_words = {}

const csv=require('csvtojson')
csv({noheader:true, delimiter: ' '})
.fromFile('cefr_words.csv')
.on('json',jsonObj=>{
  // console.log(jsonObj)
  cefr_words[jsonObj.field4] = jsonObj.field3
})
.on('done',(error)=>{
  console.log('done')
})


export function get_explain(explain) {
  return {
    type: GET_EXPLAIN,
    explain
  }
}

export function get_cefr(cefr) {
  return {
    type: GET_CEFR,
    cefr
  }
}

export function queryAsync(word: string, delay: number = 2000) {
  return (dispatch: (action: actionType) => void) => {
    mdict.dictionary('dictionary.mdx').then(function(dictionary) {
      //// dictionary is loaded
      dictionary.search({
        phrase: word,      /// '*' and '?' supported
        max: 10           /// maximum results
      }).then(function(foundWords){
        console.log('Found words:');
        console.log(foundWords);      /// foundWords is array

        var word = ''+foundWords[0];
        console.log('Loading definitions for: '+word);
        return dictionary.lookup(word); /// typeof word === string
      }).then(function(definitions){
        console.log('definitions:');     /// definition is array
        console.log(definitions);
        dispatch(get_explain(definitions))
        let cefr = cefr_words[word]
        if (cefr) {
          dispatch(get_cefr(cefr))
        }
      })
      
    });

    /*
    setTimeout(() => {
      dispatch(query(word));
    }, delay);
    */
  };
}
