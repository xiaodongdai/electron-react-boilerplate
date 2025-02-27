// @flow
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styles from './PrimaryPane.css'
import Parser from 'html-react-parser'
import SplitPane from 'react-split-pane'
import domToReact from 'html-react-parser/lib/dom-to-react'
import Divider from 'material-ui/Divider'

import { InputLabel } from 'material-ui/Input'
import TextField from 'material-ui/TextField'
/*
type Props = {
  queryAsync: () => void,
};
*/
export class WordExplainations extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleAddWord = this.handleAddWord.bind(this)
    this.handleRemoveWord = this.handleRemoveWord.bind(this)
    this.handleUserCommentsChange = this.handleUserCommentsChange.bind(this)
    this.userCommentsChange = this.userCommentsChange.bind(this)
    this.state = {userComments: {}}
  }

  componentDidMount() {
    this.processUserComments()
  }

  componentDidUpdate() {
    this.processUserComments()
  }

  processUserComments() {

    let {word, explainations} = this.props
    let userComments = {}
      console.log(`processUserComments: word:${word}, this._word=${this._word}`)
    if (this._word !== word) {

      explainations.forEach(exp => {
        userComments[exp.language] = exp.userComments
      })
      this.setState({userComments})
      console.log('update comments: ', userComments)
      this._word = word
    }

  }



  handleVoiceClick(file) {
    let audio = new Audio(file)
    audio.play()
  }

  handleAddWord(word, language) {
    let {addWord} = this.props
    addWord(word, language)
  }

  handleRemoveWord(word, language) {
    let {removeWord} = this.props
    removeWord(word, language)
  }

  userCommentsChange(changeComments) {
    let {changeUserComments} = this.props
    console.log('this._changeComments: ', this._changeComments)
    changeUserComments(changeComments)
  }

  handleUserCommentsChange(e, word, language) {
    let userComments = {...this.state.userComments}
    userComments[language] = e.target.value
    this.setState({userComments})
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler)
    }

    let changeComments = {
      word,
      language,
      userComments: e.target.value
    }
    // send the action 
    this.timeoutHandler = setTimeout(() => {this.userCommentsChange(changeComments)}, 500)
  }

  render() {
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
    }

    let Explain4OneDictionary = props => Parser(props.explain || '', parserOptions)

    let Explain4OneLanguage = props => {
      let {dictionaries} = props
      return <div>
        {
          dictionaries.map((explain4OneDictionary, idx) => <div key={idx}>
            Dictionary: {explain4OneDictionary.dictionary} <br/>
            <Explain4OneDictionary explain={explain4OneDictionary.explain}/>
          </div>)
        }
        </div>
    }

    let self = this
    let AddButton = props => {
      console.log(`addButton:  ${props.isAdded}  `)
      let text = props.isAdded ? `Remove from wordbook '${props.language}'` : `Add to wordbook '${props.language}'`
      let callbackFunc = props.isAdded ? self.handleRemoveWord : self.handleAddWord
      return <button type="button" onClick={() => {callbackFunc(props.word, props.language)}}>{text}</button>
    }

    console.log('WordExplainations         ')
    let {explainations, language, word} = this.props
    console.log(`explainations: ${explainations}`, explainations)
    if (!explainations) {
      return <div></div>
    }

    let filteredExp = explainations
    if (language) {
      filteredExp = explainations.filter(exp => exp.language === language)
    }
    
    console.log(' this.state.userComments  ', this.state.userComments)
    return <div>
            {
              filteredExp.map(
                (exp, idx) => <div key={idx}>
                    <Explain4OneLanguage dictionaries={exp.dictionaries}/>
                    <AddButton isAdded={exp.isAdded} language={exp.language} word={word}/>
                    <div className={styles.divider}/>
                     CEFR:{exp.cefr || 'N/A'}
                     <br/>
                     Rank:{exp.rank || 'N/A'}
                     <br/>
                     <TextField fullWidth={true}
                      value={this.state.userComments[exp.language] || ''} 
                      label="User Comments" 
                      margin="normal" 
                      onChange={(e) => this.handleUserCommentsChange(e, word, exp.language)}/>
                     <div className={styles.divider}/>
                     </div>)
            }
          </div>
  }
}



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
    handleKnow(reviewInfo.curReviewIndex, reviewInfo.language)
  }

  handleOnClickDontKnow() {

    let { handleDontKnow, reviewInfo} = this.props
    handleDontKnow(reviewInfo.curReviewIndex, reviewInfo.language)
  }

  handleOnClickWord(word) {
    let {
      queryAsync
    } = this.props;
    queryAsync(word, true) // review = true
  }

  render() {
    let {curState, 
        wordInfo, 
        reviewInfo, 
        addWord, 
        removeWord, 
        changeUserComments} = this.props

    // TODO: we should add the event handler for links here.
    let Explain = props => Parser(wordInfo.explain || '', parserOptions)
    // find images or sounds in the text.

    let ReviewWordInfo = () => {
      if (!reviewInfo) {
        return <div>Error</div>
      }

      let {show, curReviewIndex, wordListReview} = reviewInfo
      if (!wordListReview || !wordListReview.length) {
        return <div>Error</div>
      }

      if (show) {
        return <WordExplainations word={wordInfo.word} explainations={wordInfo.explainations} language={reviewInfo.language}/>
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
  
    return curState === 'dictionary' ? 
      <div className={styles.answer}>
        <WordExplainations word={wordInfo.word} 
                           explainations={wordInfo.explainations}
                           addWord={addWord}
                           removeWord={removeWord}
                           changeUserComments={changeUserComments}/></div> :
      <div className={styles.answer}><ReviewPane/></div>
  }
}
