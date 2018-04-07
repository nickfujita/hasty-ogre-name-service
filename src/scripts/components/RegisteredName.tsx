import * as React from 'react';
import * as Redux from 'redux';
import {
  unregisterName,
  preApproveTransfer,
  postForSale,
  cancelForSale,
  acceptOffer,
} from '../actions/nameService';
import { Offers } from './wallet';

interface RegisteredNameProps extends React.Props<any> {
  dispatch: Redux.Dispatch<any>;
  address: string;
  name: string;
  saleAmount: number;
  offers: Offers;
}

class RegisteredName extends React.Component<RegisteredNameProps, any> {
  private nameInput;
  private forSaleInput;

  constructor(state, props) {
    super(state, props);

    this.state = {
      nameQuery: null,
    };
  }

  componentWillMount() {
    this.handleUnregister = this.handleUnregister.bind(this);
    this.handleTransfer = this.handleTransfer.bind(this);
    this.handleForSale = this.handleForSale.bind(this);
    this.handleCancelForSale = this.handleCancelForSale.bind(this);
    this.handleAcceptOffer = this.handleAcceptOffer.bind(this);
  }

  handleAcceptOffer(newOwnerAddress) {
    const {dispatch, address, name, offers} = this.props;
    dispatch(acceptOffer(name, address, newOwnerAddress));
    alert(`Your request accept the offer from ${newOwnerAddress} for the name: ${name} for ${offers[newOwnerAddress]} hons has been submitted. Please wait until the next block to for confirmation.`);
  }

  handleForSale() {
    const {dispatch, address, name} = this.props;
    const amount = this.forSaleInput.value;
    amount && dispatch(postForSale(name, address, amount));
    alert(`Your request to post the name: ${name} for sale at ${amount} hons has been submitted. Please wait until the next block to for confirmation.`);
    this.forSaleInput.value = null;
  }

  handleCancelForSale() {
    const {dispatch, address, name} = this.props;
    dispatch(cancelForSale(name, address));
    alert(`Your request to cancel the sale for the name: ${name} has been submitted. Please wait until the next block to for confirmation.`);
  }

  handleUnregister() {
    const {dispatch, address, name} = this.props;
    dispatch(unregisterName(name, address));
    alert(`Your unregistration request for the name: ${name} has been submitted. Please wait until the next block to for confirmation.`);
  }

  handleTransfer() {
    const {dispatch, address, name} = this.props;
    const toAddress = this.nameInput.value;
    toAddress && dispatch(preApproveTransfer(name, address, address, toAddress));
    alert(`Your request to transfer the name: ${name} from your address: ${address} to it's new owner address: ${toAddress} has been submitted. Please wait until the next block to for confirmation. Please also have the recipient of this name submit a transfer request as well if they haven't already done so.`);
    this.nameInput.value = null;
  }

  renderInputField(title, reference, type = 'text') {
    return (
      <div className='input-field'>
        <div>{title}</div>
        <input ref={ref => this[reference] = ref} type=''/>
      </div>
    );
  }

  renderTransfer() {
    return(
      <div>
        {this.renderInputField('Transfer to: ', 'nameInput')}
        <div className='name-button-wrapper'>
          <button className='name-button transfer' onClick={this.handleTransfer}>Transfer</button>
          <button className='name-button unregister' onClick={this.handleUnregister}>Unregister</button>
        </div>
      </div>
    );
  }

  renderForSale() {
    const {saleAmount} = this.props;
    if (saleAmount) {
      return (
        <div>
          <div>{`Posted for sale: ${saleAmount} hons`}</div>
          <button className='name-button' onClick={this.handleCancelForSale}>Cancel</button>
        </div>
      );
    }

    return (
      <div>
        {this.renderInputField('Post for sale: ', 'forSaleInput', 'number')}
        <button className='name-button' onClick={this.handleForSale}>Post</button>
      </div>
    );
  }

  renderOffers() {
    const {offers} = this.props;
    return offers && (
      <div>
        <h4>Offers:</h4>
        {Object.keys(offers).map((address, index) => {
          return (
            <div key={`offer${index}`}>
              {`Offer from ${address} for: ${offers[address]} hons `}
              <button className='name-button' onClick={() => this.handleAcceptOffer(address)}>Accept</button>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <div className='registered-name'>
        <div className='name-text'>{this.props.name}</div>
        {this.renderTransfer()}
        {this.renderForSale()}
        {this.renderOffers()}
      </div>
    );
  }
}

export default RegisteredName;
