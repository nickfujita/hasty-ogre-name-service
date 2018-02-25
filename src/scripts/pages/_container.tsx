import * as React from 'react';
import { connect } from 'react-redux';
import App from './app';

class Container extends React.Component<any, any> {
  render() {
    return (
      <div className='app_content'>
        <App/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return state;
}

export default connect(mapStateToProps)(Container);
