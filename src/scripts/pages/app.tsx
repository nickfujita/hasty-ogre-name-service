import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { get } from 'lodash';
import { initNeon } from '../actions/neo';
import Wallet from '../components/wallet';
import WalletRegistration from '../components/WalletRegistration';
import WalletCreation from '../components/WalletCreation';

class App extends React.Component<any, any> {

  componentWillMount() {
    this.props.dispatch(initNeon());
  }

  renderTokenInfo() {
    const name = get(this, 'props.neo.token.name') || '';
    const symbol = get(this, 'props.neo.token.symbol') || '';
    const totalSupply = get(this, 'props.neo.token.totalSupply') || 0;
    const decimals = get(this, 'props.neo.token.decimals') || '';
    return (
      <div className='token-info'>
        <div>{`Token Name: ${name}`}</div>
        <div>{`Token Symbol: ${symbol}`}</div>
        <div>{`Token Total Supply: ${totalSupply}`}</div>
        <div>{`Token Decimals: ${decimals}`}</div>
      </div>
    );
  }

  renderWallets() {
    return Object.keys(this.props.neo.wallets).map((address, index) => {
      const walletAssets = get(this, `props.neo.walletBalances[${address}]`);
      const walletNames = get(this, `props.neo.walletNames[${address}]`);
      return (
        <Wallet
          key={index}
          dispatch={this.props.dispatch}
          address={address}
          balances={walletAssets}
          names={walletNames}
        />
      );
    });
  }

  render() {
    const nameQuery = this.props.neo.nameQuery;
    return (
      <div className='index'>
        <h1>Hasty Ogre Name Service</h1>
        {this.renderTokenInfo()}
        <button
          className='clear-cache'
          onClick={() => {
            localStorage.clear();
            alert('All wallets cleared from local storage! ^^');
          }}
        >
          Clear saved wallets from local cache
        </button>
        <div className='wallet-management'>
          <WalletRegistration dispatch={this.props.dispatch}/>
          <WalletCreation dispatch={this.props.dispatch}/>
        </div>
        {this.renderWallets()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return state;
}

export default connect(mapStateToProps)(App);
