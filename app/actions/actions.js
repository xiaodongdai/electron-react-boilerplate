// @flow
import type { stateType } from '../reducers/reducers'
import mdict from 'mdict'
import csv from 'csvtojson'


type actionType = {
  +type: string,
  +type: string
};

export const RETRIVED_WORDINFO= 'RETRIVED_WORDINFO';
export const ADD_WORD = 'ADD_WORD'
export const SORT_WORDS = 'SORT_WORDS'
export const START_REVIEW = 'START_REVIEW'
export const WORD_KNOW = 'WORD_KNOW'
export const WORD_DONTKNOW = 'WORD_DONTKNOW'
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


export function handleKnow(wordIndex) {
  return {
    type: WORD_KNOW,
    wordIndex
  }
}

export function handleDontKnow(wordIndex) {
  return {
    type: WORD_DONTKNOW,
    wordIndex
  }
}

export function retrivedWordInfo(wordInfo) {
  return {
    type: RETRIVED_WORDINFO,
    ...wordInfo
  }
}

export function startReview() {
  return {
    type: START_REVIEW
  }
}

export function addWord(word) {
  let cefr = cefr_words[word]
  let subTitle = subtitle_words[word]
  // TODO, for phase, the lowest rank will be used.
  return {
    type: ADD_WORD,
    word,
    ...subTitle,
    cefr,
    addedAt:  Date.now(),
    // tomorrow = new Date()
    //nextReviewAt: tomorrow.setDate(tomorrow.getDate() + 1),
    nextReviewAt: Date.now(),
    reviewedTimes: 0,
    userComments: ''
  }
}

export function sortWords() {
  return {
    type: SORT_WORDS
  }
}

export function queryAsync(word: string, review: bool = false) {
  return (dispatch: (action: actionType) => void) => {
    mdict.dictionary('dictionary.mdx').then(dictionary => {
      //// dictionary is loaded
      dictionary.search({
        phrase: word,      /// '*' and '?' supported
        max: 10           /// maximum results
      }).then(function(foundWords){
        var word = ''+foundWords[0];
        return dictionary.lookup(word); /// typeof word === string
      }).then(([explain]) => {
        // parse the explain, find out the files or images.
        console.log('got explain' + explain)
        let cefr = cefr_words[word]
        let subTitle = subtitle_words[word]
        dispatch(retrivedWordInfo({...subTitle, 
          cefr, 
          explain,
          userComments: '',
          review
        }))
      }).then(() => {
        mdict.dictionary('dictionary.mdd').then(mdd => {
          console.log('mdd: a')
          return mdd.lookup('\\testar.spx')
        }).then(result => {
          console.log('result from mdd : ', result)
        }).catch(e => {
          console.log('error; ', e)
        })
      }) 
    });
  };
}
