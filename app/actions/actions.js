// @flow
"use strict"
import type { stateType } from '../reducers/reducers'
import mdict from 'mdict'
import csv from 'csvtojson'
import fs from 'fs'
import Promise from 'bluebird'
import Ogg from '../speex/ogg'
import Speex from '../speex/speex'
/*import {BitString} from '../speex/bitstring'
import {PCMData} from '../speex/pcmdata.min'
import {Ogg, Speex} from '../speex/speex'
*/
var writeFile = Promise.promisify(require("fs").writeFile);

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
    console.log('done ')
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

function decodeFile(bufSpx) {
  
  var stream, samples, st;
  var ogg, header, err;
  console.log('start decode   ', bufSpx)
  ogg = new Ogg(bufSpx, {file: true});
  console.log('ogg: ', ogg)
  ogg.demux();
  stream = ogg.bitstream();

  header = Speex.parseHeader(ogg.frames[0]);
  console.log(header);

  comment = new SpeexComment(ogg.frames[1]);
  console.log(comment.data);

  st = new Speex({
    quality: 8,
    mode: header.mode,
    rate: header.rate
  });

  samples = st.decode(stream, ogg.segments);

  var waveData = PCMData.encode({
      sampleRate: header.rate,
      channelCount: header.nb_channels,
      bytesPerSample: 2,
      data: samples
    });

  // array buffer holding audio data in wav codec
  return Speex.util.str2ab(waveData);
}

function lookupRes(mdd, file) {
  return mdd.lookup(file.filename).then(raw => {
    // if it is spx, we decode it
    let suffix = file.filename.substr(file.filename.length - 4)
    let buffer = null
    let type = ''
    switch(suffix) {
      case '.spx':
        let data = String.fromCharCode.apply(null, raw)
        buffer = decodeFile(data)
        type = 'audio/wav'
        break
      case '.mp3':
        buffer = raw
        type = 'audio/mp3'
        break
      case '.bmp':
        buffer = raw
        type = 'image/bmp'
        break
      case '.png':
        buffer = raw
        type = 'image/png'
        break
      case '.jpg':
        buffer = raw
        type = 'image/jpg'
        break
    }
    let blob = new Blob([buffer], {type})
    let objectUri = URL.createObjectURL(blob)
    return {...file, objectUri}
  })
}


export function queryAsync(word: string, review: bool = false) {
  return (dispatch: (action: actionType) => void) => {
    mdict.dictionary(['dictionary.mdx']).then(dictionary => {
      //// dictionary is loaded
      dictionary.search({
        phrase: word,      /// '*' and '?' supported
        max: 10           /// maximum results
      }).then(function(foundWords){
        var word = ''+foundWords[0];
        return dictionary.lookup(word); /// typeof word === string
      }).then(([originExplain]) => {
        let files = []
        // parse the explain, find out the files or images.
        mdict.loadmdd('dictionary.mdd').then(mdd => {
          // download resources.
          let re = /"(sound|file):\/\/([a-z0-9.]*)"/g
          let matches = null
          let queries = []
          console.log('expain: ', originExplain)
          while (matches = re.exec(originExplain)) {
            // the uri is like "sound://test.wav"
            files.push({filename: matches[2], originUri: matches[0]})
          }

          re = /"<img +src *= *"([a-z0-9]+.[a-z]+)"/g
          while (matches = re.exec(originExplain)) {
            files.push({filename: matches[1], originUri: matches[0]})
          }

          return Promise.all(files.map(file => lookupRes(mdd, file)))
        }).then(files => {
          // replace the originuri with objecturi
          files.forEach(file => {
            let {originUri, objectUri} = file
            originExplain = originExplain.replace(originUri, objectUri)
          })
          let explain = originExplain
          let cefr = cefr_words[word]
          let subTitle = subtitle_words[word]
          dispatch(retrivedWordInfo({...subTitle, 
            cefr, 
            explain,
            userComments: '',
            review,
            files
          }))
        })
      })
    })
  };
}
