import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import * as fs from 'fs';

let initialState = null
try {
  let strObj = fs.readFileSync('wordsList.obj', 'utf8')
  if (strObj && strObj !== '') {
    let wordListDisplay = []
    let wordList = JSON.parse(strObj)
    wordList.forEach((word, idx) => {
      word.index = idx
      wordListDisplay.push({word, idx})
    })
    initialState = {wordList, wordListDisplay, curState: 'dictionary'}
  }
}catch (e) {
  
}


const store =  initialState ? configureStore(initialState) : configureStore()

// TODO: subscribe the store     
let prevWordList = null
let unsubscribe = store.subscribe(() => {
  let curWordList = store.getState().wordList
  if (curWordList !== prevWordList) {
    console.log('wordList changed1， writting to file1!')
    fs.writeFile('wordsList.obj', JSON.stringify(curWordList), err => {
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
