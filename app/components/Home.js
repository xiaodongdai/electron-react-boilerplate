// @flow
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styles from './Home.css'
import Parser from 'html-react-parser'
import SplitPane from 'react-split-pane'


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
  }

  handleSort() {
    let {
      sort_words
    } = this.props
    sort_words()
  }

  handleOnClickAsync() {
    const {_word} = this.refs
    console.log(`value112131233=${_word.value}`)
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
      add_word
    } = this.props;
    add_word(_word.value)
  }

  render() {
    let {explain, rankInfo, wordList} = this.props
    console.log('wordLi11t111111111:', wordList)
    let MyTest = props => Parser(explain)
    
    let WordList = () => {
      let items = wordList.map((item, idx) => 
        <li key={idx.toString()} onClick={() => {this.handleClickItem(item.word)}}>
          {item.word}
        </li>
      )
      console.log('ite1ms111', items)
      return (<ul>{items}</ul>)
    }

 
    return (
      <SplitPane split="horizontal" allowResize={false} minSize={50} defaultSize={80}>
        <div className={styles.container} data-tid="container">
          <input ref="_word" type="text" />
          <button type="button" onClick={this.handleOnClickAsync}>Query</button>
          <button type="button" onClick={this.handleAdd}>Add</button>
        </div>
        <SplitPane split="vertical" allowResize={true} minSize={300} primary="second">
          <div>
            <button type="button" onClick={this.handleSort}>Sort</button>
            <WordList/>
          </div>
          <div className={styles.answer} data-tid="answer" id="answer">
            <MyTest/>
            <br/>
            CEF11:{rankInfo.cefr}
            <br/>
            RANK:{rankInfo.rank}

          </div>
        </SplitPane>
      </SplitPane>
    );
  }
}
