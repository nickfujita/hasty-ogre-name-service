import * as React from 'react';
import * as Redux from 'redux';
import { registerName, unregisterName, transferName } from '../actions/nameService';
import { queryName, queryAddress } from '../api/nameService';
import RegisteredName from './RegisteredName';

interface NameServiceProps extends React.Props<any> {
  dispatch: Redux.Dispatch<any>;
  address: string;
  names: string[];
}

class NameService extends React.Component<NameServiceProps, any> {
  private nameInput;

  constructor(state, props) {
    super(state, props);

    this.state = {
      currentNameOwner: null,
    };
  }

  componentWillMount() {
    this.handleNameLookup = this.handleNameLookup.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleUnregister = this.handleUnregister.bind(this);
    this.handleTransfer = this.handleTransfer.bind(this);
    // queryAddress(this.props.address);
  }

  handleNameLookup() {
    const value = this.nameInput.value;
    queryName(value)
    .then(address => {
      this.setState({
        ...this.state,
        currentNameOwner: address,
      });
    });
  }

  handleRegister() {
    const {dispatch, address} = this.props;
    const {value} = this.nameInput;
    dispatch(registerName(value, address));
    this.clearRegistration();
  }

  handleUnregister(name) {
    const {dispatch, address} = this.props;
    dispatch(unregisterName(name, address));
  }

  handleTransfer() {
    const {dispatch, address} = this.props;
    const {currentNameOwner} = this.state;
    const name = this.nameInput.value;
    name && currentNameOwner && dispatch(transferName(name, address, currentNameOwner, address));
    this.clearRegistration();
  }

  clearRegistration() {
    this.nameInput.value = null;
    this.setState({
      ...this.state,
      currentNameOwner: null,
    });
  }

  renderInputField(title, reference) {
    return (
      <div className='input-field'>
        <div>{title}</div>
        <input ref={ref => this[reference] = ref}/>
      </div>
    );
  }

  renderRegister() {
    const {currentNameOwner} = this.state;
    return (
      <div>
        <div>{currentNameOwner ? `This name is already taken by: ${currentNameOwner}` : this.nameInput && this.nameInput.value ? 'This name is free, would you like to register?' : ''}</div>
        {this.renderRegisterForm()}
      </div>
    );
  }

  renderRegisterForm() {
    const {currentNameOwner} = this.state;
    if (this.nameInput && this.nameInput.value && !currentNameOwner) {
      return (
        <button onClick={this.handleRegister}>Register now</button>
      );
    }

    if (this.nameInput && this.nameInput.value && currentNameOwner) {
      return (
        <button onClick={this.handleTransfer}>Request transfer</button>
      );
    }
  }

  renderNames() {
    const {names, address, dispatch} = this.props;
    return (
      <div className='names-list'>
        My registered names:
        <ul>
          {names && names.map((name, index) => {
            return (
              <li className='names-list-item' key={index}>
                <RegisteredName
                  dispatch={dispatch}
                  address={address}
                  name={name}
                />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  render() {
    return (
      <div className='name-service'>
        <h3>Name Service</h3>
        {this.renderNames()}
        <br/>
        {this.renderInputField('Look up a name to register: ', 'nameInput')}
        <button onClick={this.handleNameLookup}>Lookup</button>
        {this.renderRegister()}
      </div>
    );
  }
}

export default NameService;
