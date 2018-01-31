// @flow
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styles from './Home.css'
import Parser from 'html-react-parser'
import SplitPane from 'react-split-pane'
import PrimaryPane from '../containers/PrimaryPane'

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
  }

  handleSort() {
    let {
      sortWords
    } = this.props
    sortWords()
  }

  handleOnClickAsync() {
    const {_word} = this.refs
    console.log(`value=${_word.value}`)
    let {
      queryAsync
    } = this.props;
    console.log(this.props)
    queryAsync(_word.value)
  }

  handleClickItem(word) {
    let {
      queryAsync
    } = this.props;
    queryAsync(word)
  }

  handleAdd() {
    const {_word} = this.refs
    let {
      addWord
    } = this.props;
    addWord(_word.value)
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
    let reviewPane = (reviewData) => {
      return (<div>
            {reviewData.curWord}
            Do you know?
            <br/>
            <button type="button" onClick={this.handleKnow}>I Know</button>
            <button type="button" onClick={this.handleDontKnow}>Not Know</button>
            </div>)
    }

    let Explain = props => Parser(explain)
    
    let WordList = () => {
      let items = wordList.map((item, idx) => 
        <li key={idx.toString()} onClick={() => {this.handleClickItem(item.word)}}>
          {item.word}
        </li>
      )
      return (<ul>{items}</ul>)
    }

 
    return (
      <SplitPane split="horizontal" allowResize={false} minSize={50} defaultSize={80}>
        <div className={styles.container} data-tid="container">
          <input ref="_word" type="text" />
          <button type="button" onClick={this.handleOnClickAsync}>Query</button>
          <button type="button" onClick={this.handleAdd}>Add</button>
          <button type="button" onClick={this.handleReview}>Review</button>
        </div>
        <SplitPane split="vertical" allowResize={true} minSize={300} primary="second">
          <div>
            <button type="button" onClick={this.handleSort}>Sort</button>
            <WordList/>
          </div>
          <PrimaryPane wordInfo/>
        </SplitPane>
      </SplitPane>
    );
  }
}
