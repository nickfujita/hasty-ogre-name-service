import * as React from 'react';
import * as Redux from 'redux';
import { addWallet } from '../actions/app';
import { wallet } from '@cityofzion/neon-js';
import { udpateAddressInfo } from '../actions/neo';

interface WalletCreationProps extends React.Props<any> {
  dispatch: Redux.Dispatch<any>;
}

const initialState = {
  address: null,
  privateKey: null,
};

class WalletCreation extends React.Component<WalletCreationProps, any> {

  constructor(state, props) {
    super(state, props);

    this.state = initialState;
  }

  componentWillMount() {
    this.handleCreate = this.handleCreate.bind(this);
  }

  handleCreate() {
    const {dispatch} = this.props;
    const {address, privateKey} = this.state;

    if (address && privateKey) {
      dispatch(addWallet(address, privateKey));
      this.setState(initialState);
      dispatch(udpateAddressInfo());
    } else {
      const newWallet = new wallet.Account('');
      this.setState({
        address: newWallet.address,
        privateKey: newWallet.privateKey,
      });
    }
  }

  render() {
    const {address, privateKey} = this.state;
    return (
      <div className='wallet-creation wallet-management-item'>
        <h3>Create new wallet</h3>
        <div className='key-wrapper'>{address && `Address: ${address}`}</div>
        <div className='key-wrapper'>{privateKey && `PrivateKey: ${privateKey}`}</div>
        <button onClick={this.handleCreate}>
          {address && privateKey ? 'Load' : 'Generate keys'}
        </button>
      </div>
    );
  }
}

export default WalletCreation;
