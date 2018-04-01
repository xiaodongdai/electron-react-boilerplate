// @flow
"use strict"
import type { stateType } from '../reducers/reducers'
import mdict from 'mdict'
import csv from 'csvtojson'
import fs from 'fs'
import Ogg from '../speex/ogg'
import {Speex, SpeexComment} from '../speex/speex'
import {PCMData} from '../speex/pcmdata'
/*import {BitString} from '../speex/bitstring'
import {PCMData} from '../speex/pcmdata.min'
import {Ogg, Speex} from '../speex/speex'
*/


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
let cefr_words = []
let subtitle_words = []


function loadCefr(cefrArr, lang) {
  cefrArr[lang] = []
  csv({noheader:true, delimiter: ' '})
  .fromFile(`cefr_words_${lang}.csv`)
  .on('json',jsonObj=>{
    // console.log(jsonObj)
    if (cefrArr[lang][jsonObj.field4] === undefined) {
      // does not exist, we create a new
      cefrArr[lang][jsonObj.field4] = jsonObj.field3
    } else {
      // use the lowest level.
      if (cefrArr[lang][jsonObj.field4] > jsonObj.field3) {
        cefrArr[lang][jsonObj.field4] = jsonObj.field3
      }
    }
  })
  .on('done',error=>{
    console.log('done')
  })
}

function loadFreq(subTitleArr, lang) {
  subTitleArr[lang] = []
  let lineNumber = 0
  csv({noheader:true, delimiter: ' '})
  .fromFile(`${lang}_50k.txt`)
  .on('json',jsonObj=>{
    // console.log(jsonObj)
    let rank = lineNumber
    // let freq = jsonObj.field2
    if (subTitleArr[lang][jsonObj.field1] === undefined) {
      subTitleArr[lang][jsonObj.field1] = rank
    }

    lineNumber += 1
  })
  .on('done',(error)=>{
    console.log('done ')
  })
}

// load Swedish data
console.log('start loading data')
loadCefr(cefr_words, 'sv')
loadFreq(subtitle_words, 'sv')
console.log(`cefr_words:  ${cefr_words['sv']}`)
// load English data
loadCefr(cefr_words, 'en')
loadFreq(subtitle_words, 'en')
console.log('end loading data')






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
  console.log('start decode       ', bufSpx)
  ogg = new Ogg(bufSpx, {file: true});
  console.log('ogg:  ', ogg)
  ogg.demux();
  stream = ogg.bitstream();
  console.log('Speex:  ', Speex)
  header = Speex.parseHeader(ogg.frames[0]);
  console.log('header: ', header);

  let comment = new SpeexComment(ogg.frames[1]);
  console.log(comment.data);

  st = new Speex({
    quality: 8,
    mode: header.mode,
    rate: header.rate
  });
  console.log('Speex created ! ')
  samples = st.decode(stream, ogg.segments);
  console.log('decoded! ')
  var waveData = PCMData.encode({
      sampleRate: header.rate,
      channelCount: header.nb_channels,
      bytesPerSample: 2,
      data: samples
    });

  // array buffer holding audio data in wav codec
  return Speex.util.str2ab(waveData);
}


/*
function lookupRes(mdd, file) {
  console.log(`file1: ${file.filename}`)
  return mdd.lookup(file.filename).then(raw => {
    // if it is spx, we decode it
    let suffix = file.filename.substr(file.filename.length - 4)
    let buffer = null
    let type = ''
    console.log(`file2: ${file.filename}`)
    switch(suffix) {
      case '.spx':
        let data = String.fromCharCode.apply(null, raw)
        buffer = decodeFile(data)
        console.log('buffer:', buffer )
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
*/



function changeFontColor([originExplain]) {
  console.log('changeFontColor ' + originExplain)
  let explain = originExplain.replace('<font color="silver">', '<font color="black">')
  return explain
}


// get external files from the explain
function getExtFiles(explain) {
  let re = /"(sound|file):\/\/([a-z0-9.]*)"/g
  let matches = null
  let queries = []
  let files = []
  console.log('explain:    ', explain)
  console.log('match starting     ')
  while (matches = re.exec(explain)) {
    // the uri is like "sound://test.wav"
    console.log(`matched1: ${matches[2]} and ${matches[0]}`)
    files.push({filename: matches[2], originUri: matches[0]})
  }

  re = /<img +src *= *"([a-z0-9_]+\.[a-z]+)"/g
  while (matches = re.exec(explain)) {
    console.log(`matched2: ${matches[1]} and ${matches[1]}`)
    files.push({filename: matches[1], originUri: matches[1]})
  }
  console.log('files:  ', files)
  return files
}




function lookupMdd(mdd, files) {
  return Promise.all(files.map(file => mdd.lookup(file.filename)))
}


function loadMdd(filename) {
  return mdict.loadmdd(filename + '.mdd')
}

function replaceExplain(raws, explain, files) {
  console.log('replaceExplain')

  console.log(raws)
  raws.forEach((raw, index) => {
    let file = files[index]
    let type = ''
    let suffix = file.filename.substr(file.filename.length - 4)
    switch(suffix) {
      case '.spx':
        let data = String.fromCharCode.apply(null, raw)
        file.buffer = decodeFile(data)
        console.log('buffer:      ', file.buffer )
        type = 'audio/wav'
        break
      case '.mp3':
        file.buffer = raw
        type = 'audio/mp3'
        break
      case '.bmp':
        file.buffer = raw
        type = 'image/bmp'
        break
      case '.png':
        file.buffer = raw
        type = 'image/png'
        break
      case '.jpg':
        file.buffer = raw
        type = 'image/jpg'
        break
    }
    let blob = new Blob([file.buffer], {type})
    file.objectUri = URL.createObjectURL(blob)
    explain = explain.replace(file.originUri, file.objectUri)
  })

  return {explain, files}
}

export function lookUpDictionary(word, filename, isMddExists = true) {

  if (isMddExists) {
    let localExplain = ''
    let localFiles = []
    return mdict.dictionary(filename + '.mdx').then(dictionary => dictionary.lookup(word))
      .then(changeFontColor).then(explain => localExplain = explain)
      .then(getExtFiles).then(files => {localFiles = files})
      .then(() => loadMdd(filename))
      .then(mdd => lookupMdd(mdd, localFiles))
      .then(results => replaceExplain(results, localExplain, localFiles))
  } else {
    return mdict.dictionary(filename + '.mdx').then(dictionary => dictionary.lookup(word))
      .then(changeFontColor)
      .catch(e => {console.log(`error happened for  ${filename}: ${e} `)})
  }
}


/*
    explains: [
      {
        language: string,
        cefr: string,
        rank: int,
        dictionaries: [
          dictionary: string,
          explain:    string
        ]
        userComments: string
      }
    ]
*/
function getIndexOfLanguage(explains, lang) {
  explains.forEach((explain, index) => {
    if(explain.language === lang) {
      return index
    }
  })
  return -1
}

export function queryAsync(word: string, review: bool = false) {
  let lookup = lookUpDictionary
  return (dispatch: (action: actionType) => void) => {
    let dictionaries = [{name: 'sv-en-folkets-lexikon', mddExists: true, lang: 'sv'},
                        {name: 'en-ch-langdao-2015.6', mddExists: false, lang: 'en'}]
    Promise.all(dictionaries.map(dict => lookUpDictionary(word, dict.name, dict.mddExists)))
      .then(results => {
        let {explains, files} = results.reduce((acc, cur, curIndex) => {
          if (cur === undefined || cur.explain === undefined) {
            return acc
          }

          // check if the language exists.
          let explains = acc.explains
          let files = acc.files
          let index = getIndexOfLanguage(acc.explains)
          if (index === -1) {
            let language = dictionaries[curIndex].lang
            explains.push({
              language,
              cefr:     cefr_words[language][word],
              rank:     subtitle_words[language][word],
              dictionaries: [{explain: cur.explain, dictionary: dictionaries[curIndex].name}],
            })
          } else {
            acc.explains.dictionaries.push({explain: acc.explain, dictionary: dictionaries[curIndex].name})
          }

          cur.files.forEach(file => {
            if (acc.files.indexOf(file) === -1) {
              files.push(file)
            }
          })

          return {explains, files}
        }, {explains: [], files: []})

        console.log('explains: ', explains)
        dispatch(retrivedWordInfo({
          explains,
          files,
          review,
        }))
      })
  }
}
