import {
  UPDATE_WALLET_BALANCE,
  UPDATE_ADDRESS_NAMES,
} from '../constants/actions';
import { setNet, getNet } from '../api/net';
import { checkBalance, makeIntents, sendAsset } from '../api/wallet';
import { isEqual } from 'lodash';
import { fetchTokenDetails, fetchAllTokenBalances } from './nep5';
import Neon, { u, wallet, sc, api } from '@cityofzion/neon-js';
import { nep5Tokens } from '../constants/test';
import { queryAddress, queryForSale, findOffers } from '../api/nameService';

let balanceRefresher;

export function initNeon() {
  return (dispatch, getState) => {
    // setNet('http://127.0.0.1:5000');
    dispatch(udpateAddressInfo());
    balanceRefresher = setInterval(() => dispatch(udpateAddressInfo()), 5000);
    dispatch(fetchTokenDetails(nep5Tokens.hons));
  };
}

export function udpateAddressInfo() {
  return (dispatch, getState) => {
    const { wallets } = getState().neo;
    Object.keys(wallets).forEach(address => {
      Promise.all([
        dispatch(fetchBalance(address)),
        dispatch(fetchAllTokenBalances(address)),
      ])
      .then(results => {
        const assets = results[0];
        const tokens = results[1];
        const combinedBalances = {...assets, ...tokens};

        const wallet = getState().neo.walletBalances[address];
        if (!isEqual(wallet, combinedBalances)) {
          dispatch(updateWalletBalance(address, combinedBalances));
        }
      });

      dispatch(fetchNames(address));
    });
  };
}

function fetchNames(address) {
  return (dispatch, getState) => {
    queryAddress(address)
    .then(names => {
      if (!names) {
        return;
      }
      const {walletNames} = getState().neo;
      const currentNames = walletNames[address];
      if (!isEqual(currentNames, names)) {
        Promise.all(names.map(name => {
          return Promise.all([queryForSale(name), findOffers(name)]);
        }))
        .then(res => {
          return names.reduce((accum, name, index) => {
            const results = res[index];
            const saleAmount = results[0];
            const offers = results[1];
            accum[name] = {
              saleAmount,
              offers,
            };
            return accum;
          }, {});
        })
        .then(namesMap => {
          dispatch(updateWalletNames(address, namesMap));
        });
      }
     });
  };
}

function fetchBalance(address) {
  return (dispatch, getState) => {
    return checkBalance(address)
    .then(apiConfig => {
      const assets = apiConfig.balance.assets;
      return Object.keys(assets).reduce((accum, asset) => {
        accum[asset] = assets[asset].balance.c[0];
        return accum;
      }, {});
    });
  };
}

export function submitSend(address: string, neoAmount: number, gasAmount: number) {
  return (dispatch, getState) => {
    const { wallets } = getState().neo;
    const validNeo = neoAmount && neoAmount > 0;
    const validGas = gasAmount && gasAmount > 0;

    if (!validGas && !validNeo) {
      return;
    }

    const assetAmounts = {};
    if (validNeo) {
      assetAmounts['NEO'] = neoAmount;
    }
    if (validGas) {
      assetAmounts['GAS'] = gasAmount;
    }

    const rawIntents = [
      {
        assetAmounts,
        address: Object.keys(wallets).reduce((accum, wallet) => {
          if (wallet !== address) {
            return wallet;
          }
          return accum;
        }),
      },
    ];
    const intents = makeIntents(rawIntents);
    const fromAccount = {
      address,
      privateKey: wallets[address],
    };
    console.log('sendAsset;', intents, fromAccount);
    sendAsset(fromAccount, intents);
  };
}

export function sendAssets(fromAddress: string, toAddress: string, neoAmount: number, gasAmount: number) {
  return (dispatch, getState) => {
    const { wallets } = getState().neo;
    const validNeo = neoAmount && neoAmount > 0;
    const validGas = gasAmount && gasAmount > 0;

    if (!validGas && !validNeo) {
      return;
    }

    const assetAmounts = {};
    if (validNeo) {
      assetAmounts['NEO'] = neoAmount;
    }
    if (validGas) {
      assetAmounts['GAS'] = gasAmount;
    }

    const rawIntents = [
      {
        assetAmounts,
        address: toAddress,
      },
    ];
    const intents = makeIntents(rawIntents);
    const fromAccount = {
      address: fromAddress,
      privateKey: wallets[fromAddress],
    };
    console.log('sendAsset;', intents, fromAccount);
    sendAsset(fromAccount, intents);
  };
}

export function updateWalletBalance(address, assets) {
  return {
    type: UPDATE_WALLET_BALANCE,
    data:  {
      address,
      assets,
    },
  };
}

export function updateWalletNames(address, names) {
  return {
    type: UPDATE_ADDRESS_NAMES,
    data:  {
      address,
      names,
    },
  };
}
