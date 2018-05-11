import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import Root from './containers/Root'
import { configureStore, history } from './store/configureStore'
import './app.global.css'
import * as fs from 'fs'


let RESOURCE_PATH = 'resources/'
if (process.env.NODE_ENV === 'production') {
  RESOURCE_PATH = process.resourcesPath + '/'
}

let WORDLIST_PATH = RESOURCE_PATH + 'wordbook/wordsList.obj'



let initialState = {curState: 'dictionary'}
try {
  let strObj = fs.readFileSync(WORDLIST_PATH, 'utf8')
  if (strObj && strObj !== '') {
    let wordListDisplay = []
    let wordList = JSON.parse(strObj)
    Object.keys(wordList).forEach(lang => {
      console.log('lang= ' + lang)
      wordList[lang].forEach((word, idx) => {
        word.index = idx
        wordListDisplay.push({word, idx})
      })
    })
    initialState = {wordList, wordListDisplay, curState: 'dictionary'}
  }
}catch (e) {
  console.log('cannot read wordList.obj  ')
}


const store =  initialState ? configureStore(initialState) : configureStore()

// TODO: subscribe the store   

let prevWordList = null
let unsubscribe = store.subscribe(() => {
  let curWordList = store.getState().wordList
  console.log('subscribe called ')
  if (prevWordList === null) {
    prevWordList = curWordList
  } else if (curWordList !== prevWordList) {
    console.log('wordList changed1， writting to file!  ')
    fs.writeFile(WORDLIST_PATH, JSON.stringify(curWordList), err => {
      if (err) {
        console.log(err)
      }
      console.log('word list has been saved')
    })
    prevWordList = curWordList
  }
})

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
