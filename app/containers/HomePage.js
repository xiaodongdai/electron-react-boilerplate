// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
//import React, { Component } from 'react';
import Home from '../components/Home';
import * as CounterActions from '../actions/home';

function mapStateToProps(state) {
  console.log('mapStateToProps: explain' , state)
  return  {explain: state.explain || '', 
    rankInfo: state.rankInfo || {}, 
    wordList: state.wordList || []}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(CounterActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);


/*
type Props = {};

export default class HomePage extends Component<Props> {
  props: Props;



  render() {
    return (
      <Home />
    );
  }
}
*/