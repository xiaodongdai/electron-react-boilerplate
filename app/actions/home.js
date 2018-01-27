// @flow
import type { stateType } from '../reducers/home'
import mdict from 'mdict'
import csv from 'csvtojson'


type actionType = {
  +type: string,
  +type: string
};

export const RETRIVED_EXPLAIN= 'RETRIVED_EXPLAIN';
export const RETRIVED_RANK = 'RETRIVED_RANK'
export const ADD_WORD = 'ADD_WORD'
export const SORT_WORDS = 'SORT_WORDS'

// load cefr file
let cefr_words = {}
let subtitle_words = {}

{
  csv({noheader:true, delimiter: ' '})
  .fromFile('cefr_words.csv')
  .on('json',jsonObj=>{
    // console.log(jsonObj)
    cefr_words[jsonObj.field4] = jsonObj.field3
  })
  .on('done',error=>{
    console.log('done')
  })
}

{
  let lineNumber = 0
  csv({noheader:true, delimiter: ' '})
  .fromFile('sv_50k.txt')
  .on('json',jsonObj=>{
    // console.log(jsonObj)
    let rank = lineNumber
    let freq = jsonObj.field2
    subtitle_words[jsonObj.field1] = {rank, freq}
    lineNumber += 1
  })
  .on('done',(error)=>{
    console.log('done')
  })
}




export function retrived_explain(explain) {
  return {
    type: RETRIVED_EXPLAIN,
    explain
  }
}

export function retrived_rank(rankInfo) {
  return {
    type: RETRIVED_RANK,
    rankInfo
  }
}

export function add_word(word) {
  let cefr = cefr_words[word]
  let subTitle = subtitle_words[word]
  // TODO, for phase, the lowest rank will be used.
  return {
    type: ADD_WORD,
    word,
    rankInfo: {...subTitle, cefr}
  }
}

export function sort_words() {
  return {
    type: SORT_WORDS
  }
}

export function queryAsync(word: string) {
  return (dispatch: (action: actionType) => void) => {
    mdict.dictionary('dictionary.mdx').then(function(dictionary) {
      //// dictionary is loaded
      dictionary.search({
        phrase: word,      /// '*' and '?' supported
        max: 10           /// maximum results
      }).then(function(foundWords){
        console.log('Found2 word1s:');
        console.log(foundWords);      /// foundWords is array
        var word = ''+foundWords[0];
        return dictionary.lookup(word); /// typeof word === string
      }).then(function(definitions){
        dispatch(retrived_explain(definitions))
        let cefr = cefr_words[word]
        let subTitle = subtitle_words[word]
        dispatch(retrived_rank({...subTitle, cefr}))
      })
    });
  };
}
