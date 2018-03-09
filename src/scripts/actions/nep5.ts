import { isEqual } from 'lodash';
import Neon, { u, wallet, sc, api, CONST } from '@cityofzion/neon-js';
import {
  UPDATE_TOKEN_NAME,
  UPDATE_TOKEN_SYMBOL,
  UPDATE_TOKEN_TOTAL_SUPPLY,
  UPDATE_TOKEN_DECIMALS,
  UPDATE_NAME_QUERY,
} from '../constants/actions';
import { readInvoke, invoke } from '../api/contract';
import { nep5Tokens } from '../constants/test';
import { updateWalletBalance } from './neo';
import { getNet } from '../api/net';
import * as nameService from '../api/nameService';

export function fetchTokenDetails(tokenContractAddress: string) {
  return (dispatch, getState) => {
    dispatch(fetchTokenName(tokenContractAddress));
    dispatch(fetchTokenSymbol(tokenContractAddress));
    dispatch(fetchTokenTotalSupply(tokenContractAddress));
    dispatch(fetchTokenDecimals(tokenContractAddress));
  };
}

function fetchTokenName(tokenContractAddress: string) {
  return (dispatch, getState) => {
    readInvoke(tokenContractAddress, 'name', [])
    .then(u.hexstring2str)
    .then(response => {
      dispatch(updateTokenName(response));
    });
  };
}

function fetchTokenSymbol(tokenContractAddress: string) {
  return (dispatch, getState) => {
    readInvoke(tokenContractAddress, 'symbol', [])
    .then(u.hexstring2str)
    .then(response => {
      dispatch(updateTokenSymbol(response));
    });
  };
}

function fetchTokenTotalSupply(tokenContractAddress: string) {
  return (dispatch, getState) => {
    readInvoke(tokenContractAddress, 'totalSupply', [])
    .then(u.fixed82num)
    .then(response => {
      dispatch(updateTokenTotalSupply(response));
    });
  };
}

function fetchTokenDecimals(tokenContractAddress: string) {
  return (dispatch, getState) => {
    readInvoke(tokenContractAddress, 'decimals', [])
    .then(response => {
      dispatch(updateTokenDecimals(response));
    });
  };
}

function fetchBalanceOf(tokenContractAddress: string, address) {
  return readInvoke(tokenContractAddress, 'balanceOf', [address])
  .then(u.fixed82num);
}

export function fetchAllTokenBalances(address: string) {
  return (dispatch, getState) => {
    return Promise.all(Object.keys(nep5Tokens).map(tokenSymbol => {
      const tokenAddress = nep5Tokens[tokenSymbol];
      const parsedAddress = sc.ContractParam.byteArray(address, 'address');

      return fetchBalanceOf(tokenAddress, parsedAddress)
      .then(response => {
        return {[tokenSymbol]: response};
      });
    }))
    .then(results => {
      return results.reduce((accum, result) => {
        return {...accum, ...result};
      }, {});
    });
  };
}

export function testHonsTransfer(fromAddress, amount) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const toAddress = Object.keys(wallets).reduce((accum, wallet) => {
      if (wallet !== fromAddress) {
        return wallet;
      }
      return accum;
    });
    const honsAddress = nep5Tokens.hons;
    dispatch(transfer(honsAddress, fromAddress, toAddress , amount));
  };
}

export function sendHons(fromAddress, toAddress, amount) {
  return (dispatch, getState) => {
    const validHons = amount && amount > 0;
    if (validHons) {
      const honsAddress = nep5Tokens.hons;
      dispatch(transfer(honsAddress, fromAddress, toAddress , amount));
    }
  };
}

export function transfer(tokenContractAddress, fromAddress, toAddress, amount) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[fromAddress];
    const fromAccountObj = {
      address: fromAddress,
      privateKey,
    };

    const scFromAddress = sc.ContractParam.byteArray(fromAddress, 'address');
    const scToAddress = sc.ContractParam.byteArray(toAddress, 'address');
    const parsedAmount = sc.ContractParam.byteArray(amount, 'fixed8');
    invoke(fromAccountObj, tokenContractAddress, 'transfer', [scFromAddress, scToAddress, parsedAmount]);
  };
}

export function mintTokens(fromAddress, neoAmount, gasAmount) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[fromAddress];
    const fromAccountObj = {
      address: fromAddress,
      privateKey,
    };
    const honsAddress = nep5Tokens.hons;

    const intents = [];
    if (neoAmount && neoAmount > 0) {
      intents.push({
        assetId: CONST.ASSET_ID.NEO,
        value: new u.Fixed8(neoAmount),
        scriptHash: honsAddress,
      });
    }
    if (gasAmount && gasAmount > 0) {
      intents.push({
        assetId: CONST.ASSET_ID.GAS,
        value: new u.Fixed8(gasAmount),
        scriptHash: honsAddress,
      });
    }

    invoke(fromAccountObj, honsAddress, 'mintTokens', [], intents);
  };
}

export function queryName(name) {
  return (dispatch, getState) => {
    nameService.queryName(name)
    .then(res => {
      console.log('nicktest; queryName', res);
      dispatch(updateNameQueryResult(res));
    });
  };
}

export function registerName(name) {
  return (dispatch, getState) => {
    const parsedMethod = sc.ContractParam.string('query');
    const parsedName = sc.ContractParam.string(name);
    const honsTokenAddress = nep5Tokens.hons;
    readInvoke(honsTokenAddress, 'NameServiceInvoke', [parsedMethod, parsedName])
    .then(res => {
      if (!!res) {
        res = u.reverseHex(res);
        res = wallet.getAddressFromScriptHash(res);
      }
      return res;
    })
    .then(res => {
      console.log('nicktest; queryName', res);
      dispatch(updateNameQueryResult(res));
    });
  };
}

function updateNameQueryResult(data) {
  return {
    type: UPDATE_NAME_QUERY,
    data,
  };
}

function updateTokenName(data) {
  return {
    type: UPDATE_TOKEN_NAME,
    data,
  };
}

function updateTokenSymbol(data) {
  return {
    type: UPDATE_TOKEN_SYMBOL,
    data,
  };
}

function updateTokenTotalSupply(data) {
  return {
    type: UPDATE_TOKEN_TOTAL_SUPPLY,
    data,
  };
}

function updateTokenDecimals(data) {
  return {
    type: UPDATE_TOKEN_DECIMALS,
    data,
  };
}
