// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
//import React, { Component } from 'react';
import PrimaryPane from '../components/PrimaryPane';
import * as Actions from '../actions/actions';

function mapStateToProps(state) {
  console.log('mapStateToProps:  explain' , state)
  return  {
    wordInfo: state.wordInfo || {},
    curState: state.curState,
    reviewInfo: state.reviewInfo || {}
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PrimaryPane);


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