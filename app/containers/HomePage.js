// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
//import React, { Component } from 'react';
import Home from '../components/Home';
import * as Actions from '../actions/actions';

function mapStateToProps(state) {
  console.log('mapStateToProps: explain' , state)
  return  {wordList: state.wordList || {}}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
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