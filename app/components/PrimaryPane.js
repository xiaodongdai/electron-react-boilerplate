// @flow
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styles from './PrimaryPane.css'
import Parser from 'html-react-parser'
import SplitPane from 'react-split-pane'
import domToReact from 'html-react-parser/lib/dom-to-react'
import Divider from 'material-ui/Divider'
import { InputLabel } from 'material-ui/Input';

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

  handleVoiceClick(file) {
    let audio = new Audio(file)
    audio.play()

  }

  render() {
    let {curState, wordInfo, reviewInfo} = this.props
    console.log('wordInfo:     ' , wordInfo)
    // TODO: we should add the event handler for links here.
    const parserOptions = {
      replace: (domNode) => {
        //console.log('domNode:  ', domNode)
        if(domNode.name === 'a') {
          // add the event handler
          //console.log('found it')
          return (<div className={styles.href} onClick={()=> {this.handleVoiceClick(domNode.attribs.href || '')}}>
            {domToReact(domNode.children)}
            </div>
            )
        } else if (domNode.name === 'img') {
          // TODO : need to replace the file path!
        }
      }
    };
    let Explain = props => Parser(wordInfo.explain || '', parserOptions)
    // find images or sounds in the text.

    let AllInfo = props => 
      <div><Explain/><br/>
      <div className={styles.divider}>-</div> 
      CEFR:{wordInfo.cefr || 'N/A '}
      <br/>
      RANK:{wordInfo.rank || 'N/A'}
      
      <div className={styles.divider}>-</div> 
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
