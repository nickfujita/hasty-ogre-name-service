import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store';
import App from './pages/app';

const store = configureStore();

import '../styles/main.scss';

class Main extends React.Component<any, any> {
  constructor(props, state) {
    super(props, state);
  }

  render() {
    return (
      <Provider store={store}>
        <App/>
      </Provider>
    );
  }
}

export function startApp() {
  ReactDOM.render(<Main/>, document.getElementById('app'));
}
