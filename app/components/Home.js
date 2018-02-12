"use strict"
// @flow
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styles from './Home.css'
import Parser from 'html-react-parser'
import SplitPane from 'react-split-pane'
import PrimaryPane from '../containers/PrimaryPane'
import TextField from 'material-ui/TextField';

type Props = {
  queryAsync: () => void,
};

export default class Home extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props)
    this.handleOnClickAsync = this.handleOnClickAsync.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.handleClickItem = this.handleClickItem.bind(this)
    this.handleSort = this.handleSort.bind(this)
    this.handleReview = this.handleReview.bind(this)
    this._handleTextChange = this._handleTextChange.bind(this)
  }

  _handleTextChange(e) {
    this._queryWord = e.target.value
  }

  handleSort() {
    let {
      sortWords
    } = this.props
    sortWords()
  }

  handleOnClickAsync() {
    //const {_word} = this.refs
    console.log('value is:   ', this._queryWord)
    if (!this._queryWord || this._queryWord === '') {
      return
    }
    let {
      queryAsync
    } = this.props;
    console.log(this.props)
    queryAsync(this._queryWord)
  }

  handleClickItem(word) {
    // force refresh!
    this.setState({'_selectedWord': word})
    this._selectedWord = word
    let {
      queryAsync
    } = this.props;
    queryAsync(word)
  }

  handleAdd() {
    let {
      addWord
    } = this.props;
    addWord(this._queryWord)
  }

  handleReview() {
    let {
      startReview
    } = this.props
    startReview()
  }

  render() {
    let {explain, rankInfo, wordList, curState} = this.props
    // reviewData: curWord, wordLists, 

    
    let WordList = () => {
      console.log('refresh wordlist!! !')
      let items = wordList.map((item, idx) => {
        let theClass = styles.wordList
        console.log(`this._selectWord =${this._selectWord}, item.word=${item.word}`)
        if (this._selectedWord && this._selectedWord === item.word) {
          console.log('word Selected!')
          theClass = styles.selectedWordList
        }
        return <li className={theClass} key={idx.toString()} onClick={() => {this.handleClickItem(item.word)}}>
          {item.word}
        </li>
      })
      return (<ul>{items}</ul>)
    }

    return (
      <SplitPane split="horizontal" allowResize={false} minSize={50} defaultSize={80}>
        <div className={styles.container} data-tid="container">
          <TextField  label="Word" margin="normal" onChange={this._handleTextChange}/>
          <button type="button" onClick={this.handleOnClickAsync}>Query</button>
          <button type="button" onClick={this.handleAdd}>Add</button>
          <button type="button" onClick={this.handleReview}>Review</button>
        </div>
        <SplitPane split="vertical" allowResize={true} minSize={300} primary="second">
          <div className={styles.wordListContainer}>
            <WordList/>
          </div>
          <PrimaryPane wordInfo/>
        </SplitPane>
      </SplitPane>
    );
  }
}
