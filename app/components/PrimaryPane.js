// @flow
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styles from './PrimaryPane.css'
import Parser from 'html-react-parser'
import SplitPane from 'react-split-pane'


type Props = {
  queryAsync: () => void,
};

export default class PrimaryPane extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props)
    this.handleOnClicKnow = this.handleOnClicKnow.bind(this)
    this.handleOnClickDontKnow = this.handleOnClickDontKnow.bind(this)
    this.handleOnClickWord = this.handleOnClickWord.bind(this)
  }

  handleOnClicKnow() {
    let { handleKnow, reviewInfo} = this.props
    handleKnow(reviewInfo.curReviewIndex)
  }

  handleOnClickDontKnow() {

    let { handleDontKnow, reviewInfo} = this.props
    handleDontKnow(reviewInfo.curReviewIndex)
  }

  handleOnClickWord(word) {
    let {
      queryAsync
    } = this.props;
    queryAsync(word, true) // review = true
  }

  render() {
    let {curState, wordInfo, reviewInfo} = this.props
    console.log('wordInfo: ' + wordInfo.explain)


    let Explain = props => Parser(wordInfo.explain || '')
    // find images or sounds in the text.



    let AllInfo = props => <div><Explain/><br/>
            CEF11:{wordInfo.cefr || 'N/A '}
            <br/>
            RANK:{wordInfo.rank || 'N/A'}
          </div>

    let ReviewWordInfo = () => {
      if (!reviewInfo) {
        return <div>Error</div>
      }

      let {show, curReviewIndex, wordListReview} = reviewInfo
      if (!wordListReview || !wordListReview.length) {
        return <div>Error</div>
      }

      if (show) {
        return <AllInfo/>
      } else {
        let word = wordListReview[curReviewIndex].word
        return <div className={styles.review} onClick={() => {this.handleOnClickWord(word)}}> Do you know <br/>{word}</div>
      }
    }


    let ReviewPane = (props) =>  {
        return   (<div><ReviewWordInfo/>
              <button type="button" onClick={this.handleOnClicKnow}>Know</button>
              <button type="button" onClick={this.handleOnClickDontKnow}>Do not Know</button>
            </div>)
    }
  
    return curState === 'dictionary' ? <div className={styles.answer} ><AllInfo/></div> :
      <div className={styles.answer}><ReviewPane/></div>
  }
}
