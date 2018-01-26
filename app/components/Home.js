// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';

type Props = {
  query: () => void,
};

export default class Home extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props)
    this.handleOnClick = this.handleOnClick.bind(this)
        this.handleOnClickAsync = this.handleOnClickAsync.bind(this)
  }


  handleOnClick() {
    const {_word} = this.refs
    console.log(`value=${_word.value}`)
    let {
      query
    } = this.props;
    console.log(this.props)
    query(_word.value)
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
    let {explain} = this.props
    if (!explain) {
      explain = ''
    }
    console.log('render: explain=' + explain)
    return (
      <div>
        <div className={styles.container} data-tid="container">
          <input ref="_word" type="text" />
          <button type="button" onClick={this.handleOnClick}>Query!</button>
          <button type="button" onClick={this.handleOnClickAsync}>QueryAsync!</button>
          <div className={styles.answer} data-tid="answer">
          {explain}
          </div>
        </div>
      </div>
    );
  }
}
