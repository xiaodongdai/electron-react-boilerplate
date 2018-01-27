// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';
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


  render() {
    let {explain, cefr} = this.props
    let MyTest = props => 
        Parser(explain)
    
    console.log('CEFR =  ' + cefr )
 
    return (
      <SplitPane split="horizontal" minSize={50} defaultSize={80}>
        <div className={styles.container} data-tid="container">
          <input ref="_word" type="text" />
          <button type="button" onClick={this.handleOnClickAsync}>Query</button>
          <button type="button">Add</button>
        </div>
        <SplitPane split="vertical" allowResize={true} minSize={300} primary="second">
          <div>
          </div>
          <div className={styles.answer} data-tid="answer" id="answer">
            <MyTest/>
            <br/>
            CEFR:{cefr}
          </div>
        </SplitPane>
      </SplitPane>
    );
  }
}
