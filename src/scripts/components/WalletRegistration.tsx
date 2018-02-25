import * as React from 'react';
import * as Redux from 'redux';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { addWallet } from '../actions/app';

interface WalletRegistrationProps extends React.Props<any> {
  dispatch: Redux.Dispatch<any>;
}

class WalletRegistration extends React.Component<WalletRegistrationProps, any> {
  private addressInput;
  private privateKeyInput;

  componentWillMount() {
    this.handleRegister = this.handleRegister.bind(this);
  }

  renderInputField(title, reference) {
    return (
      <div className='input-field'>
        <div>{title}</div>
        <input ref={ref => this[reference] = ref}/>
      </div>
    );
  }

  handleRegister() {
    const {dispatch} = this.props;
    const address = this.addressInput.value;
    const privateKey = this.privateKeyInput.value;

    dispatch(addWallet(address, privateKey));

    this.addressInput.value = null;
    this.privateKeyInput.value = null;
  }

  render() {
    return (
      <div className='wallet-registration wallet-management-item'>
        <h3>Register existing wallet</h3>
        {this.renderInputField('Address: ', 'addressInput')}
        {this.renderInputField('PrivateKey: ', 'privateKeyInput')}
        <button onClick={this.handleRegister}>Register</button>
      </div>
    );
  }
}

export default WalletRegistration;
