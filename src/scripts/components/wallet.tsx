import * as React from 'react';
import * as Redux from 'redux';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { sendAssets } from '../actions/neo';
import { mintTokens, sendHons, registerName } from '../actions/nep5';
import { queryName } from '../api/nameService';
import NameService from './NameService';
import { removeWallet } from '../actions/app';

interface WalletProps extends React.Props<any> {
  dispatch: Redux.Dispatch<any>;
  address: string;
  balances: Balances;
  names: string[];
}

interface Balances {
  [key: string]: number;
}

class Wallet extends React.Component<WalletProps, any> {
  private addressInput;
  private privateKeyInput;
  private neoHonsFaucetInput;
  private gasHonsFaucetInput;
  private sendFormNameLookupInput;
  private sendAddress;
  private neoSendInput;
  private gasSendInput;
  private honsSendInput;

  constructor(state, props) {
    super(state, props);
  }

  componentWillMount() {
    this.submitHonsFaucet = this.submitHonsFaucet.bind(this);
    this.handleSenderFormNameLookup = this.handleSenderFormNameLookup.bind(this);
    this.submitSendForm = this.submitSendForm.bind(this);
    this.handleRemoveWallet = this.handleRemoveWallet.bind(this);
  }

  submitHonsFaucet() {
    const neoAmount = this.neoHonsFaucetInput.value;
    const gasAmount = this.gasHonsFaucetInput.value;
    this.props.dispatch(mintTokens(this.props.address, neoAmount, gasAmount));

    this.neoHonsFaucetInput.value = null;
    this.gasHonsFaucetInput.value = null;
  }

  handleSenderFormNameLookup() {
    const value = this.sendFormNameLookupInput.value;
    queryName(value)
    .then(address => {
      if (Boolean(address)) {
        this.sendAddress.value = address;
      }
    });
  }

  submitSendForm() {
    const fromAddr = this.props.address;
    const toAddr = this.sendAddress.value;
    const neoAmount = Number(this.neoSendInput.value);
    const gasAmount = Number(this.gasSendInput.value);
    const honsAmount = Number(this.honsSendInput.value);

    this.props.dispatch(sendAssets(fromAddr, toAddr, neoAmount, gasAmount));
    this.props.dispatch(sendHons(fromAddr, toAddr, honsAmount));

    this.neoSendInput.value = null;
    this.gasSendInput.value = null;
    this.honsSendInput.value = null;
  }

  handleRemoveWallet() {
    const {dispatch, address} = this.props;

    dispatch(removeWallet(address));
  }

  renderInputField(title, reference) {
    return (
      <div className='input-field'>
        <div>{title}</div>
        <input ref={ref => this[reference] = ref}/>
      </div>
    );
  }

  renderAddresses() {
    return (
      <h1>
      {`Address: ${this.props.address || '1234567899999999999999999999999'}`}
      </h1>
    );
  }

  renderBalances() {
    const { balances } = this.props;
    return balances && (
      <div className='balances'>
        {Object.keys(balances).map((asset, index) => (
          <div
            key={index}
            className='balance'
          >
              {`${asset}: ${balances[asset]}`}
          </div>
        ))}
      </div>
    );
  }

  renderHonsFaucet() {
    return (
      <div>
        <h3>Exchange NEO/GAS for HONS</h3>
        <div>
          {this.renderInputField('NEO: ', 'neoHonsFaucetInput')}
          {this.renderInputField('GAS: ', 'gasHonsFaucetInput')}
          <button onClick={this.submitHonsFaucet}>Send</button>
        </div>
      </div>
    );
  }

  renderNameLookup(inputRef: string, onLookupHandler: () => any) {
    return (
      <div>
        {this.renderInputField('Name: ', inputRef)}
        <button onClick={onLookupHandler}>Lookup</button>
      </div>
    );
  }

  renderSendForm() {
    return (
      <div>
        <h3>Send NEO/GAS/HONS</h3>
        {this.renderNameLookup('sendFormNameLookupInput', this.handleSenderFormNameLookup)}
        {this.renderInputField('To address: ', 'sendAddress')}
        <div>
          {this.renderInputField('NEO: ', 'neoSendInput')}
          {this.renderInputField('GAS: ', 'gasSendInput')}
          {this.renderInputField('HONS: ', 'honsSendInput')}
        </div>
        <button onClick={this.submitSendForm}>Send</button>
      </div>
    );
  }

  renderRemoveWallet() {
    return (
      <button className='remove-wallet' onClick={this.handleRemoveWallet}>X</button>
    );
  }

  render() {
    const {dispatch, address, names} = this.props;
    return (
      <div className='wallet'>
        {this.renderRemoveWallet()}
        {this.renderAddresses()}
        {this.renderBalances()}
        {this.renderHonsFaucet()}
        {this.renderSendForm()}
        <NameService
          dispatch={dispatch}
          address={address}
          names={names}
        />
      </div>
    );
  }
}

export default Wallet;
