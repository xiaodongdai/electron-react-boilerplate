import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware, routerActions } from 'react-router-redux';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers';
import * as homeActions from '../actions/actions';
import type { stateType } from '../reducers/reducers';

/*
state {
  curState: 'review|dictionary'
  wordList:  [
    {
      index: number
      word: string,
      cefr string
      rank int
      freq int
      addedAt: date,
      nextReviewAt: date,
      reviewedTimes: int,
      userComments:  string
    }
  ]

  wordListDisplay: [{
    word: string
    index: number,
  }]
  
  wordInfo  {
    explain: string,
    cefr:    string,
    rank:    int,
    freq:    int,
    userComments: string
  }

  reviewInfo:  {
    show bool,
    // only the first answer know or don't know matters.
    wordListReview: [{
      word: string
      isFirstTime bool
      isReviewed  bool
      index: number  // the index to original wordList
    }],
    curReviewIndex: int
  }
}
*/


const history = createHashHistory();

const configureStore = (initialState?: stateType) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  // Thunk Middleware
  middleware.push(thunk);

  // Logging middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== 'test') {
    middleware.push(logger);
  }

  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);

  // Redux DevTools Configuration
  const actionCreators = {
    ...homeActions,
    ...routerActions,
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
      actionCreators,
    })
    : compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers'))); // eslint-disable-line global-require
  }

  return store;
};

export default { configureStore, history };
