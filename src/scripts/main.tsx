import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store';
import { getRoutes } from './routes';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

import '../styles/main.scss';

class Main extends React.Component<any, any> {
  constructor(props, state) {
    super(props, state);
  }

  render() {
    return (
      <Provider store={store}>
        <Router history={history}>
          {getRoutes()}
        </Router>
      </Provider>
    );
  }
}

export function startApp() {
  ReactDOM.render(<Main/>, document.getElementById('app'));
}
