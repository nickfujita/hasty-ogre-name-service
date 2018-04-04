import * as React from 'react';
import * as Redux from 'redux';
import { unregisterName, preApproveTransfer } from '../actions/nameService';

interface RegisteredNameProps extends React.Props<any> {
  dispatch: Redux.Dispatch<any>;
  address: string;
  name: string;
}

class RegisteredName extends React.Component<RegisteredNameProps, any> {
  private nameInput;

  constructor(state, props) {
    super(state, props);

    this.state = {
      nameQuery: null,
    };
  }

  componentWillMount() {
    this.handleUnregister = this.handleUnregister.bind(this);
    this.handleTransfer = this.handleTransfer.bind(this);
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

  renderInputField(title, reference) {
    return (
      <div className='input-field'>
        <div>{title}</div>
        <input ref={ref => this[reference] = ref}/>
      </div>
    );
  }

  render() {
    return (
      <div className='registered-name'>
        <div className='name-text'>{this.props.name}</div>
        <div>
          {this.renderInputField('Transfer to: ', 'nameInput')}
          <div className='name-button-wrapper'>
            <button className='name-button transfer' onClick={this.handleTransfer}>Transfer</button>
            <button className='name-button unregister' onClick={this.handleUnregister}>Unregister</button>
          </div>
        </div>
      </div>
    );
  }
}

export default RegisteredName;
