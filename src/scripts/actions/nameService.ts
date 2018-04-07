import { isEqual } from 'lodash';
import Neon, { u, wallet, sc, api, CONST } from '@cityofzion/neon-js';
import {
  UPDATE_TOKEN_NAME,
  UPDATE_TOKEN_SYMBOL,
  UPDATE_TOKEN_TOTAL_SUPPLY,
  UPDATE_TOKEN_DECIMALS,
  UPDATE_NAME_QUERY,
} from '../constants/actions';
import * as nameService from '../api/nameService';

export function registerName(name, address) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[address];
    const fromAccountObj = {
      address,
      privateKey,
    };

    nameService.register(name, fromAccountObj);
  };
}

export function unregisterName(name, address) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[address];
    const fromAccountObj = {
      address,
      privateKey,
    };

    nameService.unregister(name, fromAccountObj);
  };
}

export function preApproveTransfer(name, callerAddress, fromAddress, toAddress) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[callerAddress];
    const callerAccountObj = {
      address: callerAddress,
      privateKey,
    };

    nameService.preApproveTransfer(name, callerAccountObj, fromAddress, toAddress);
  };
}

export function requestTransfer(name, callerAddress, fromAddress, toAddress) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[callerAddress];
    const callerAccountObj = {
      address: callerAddress,
      privateKey,
    };

    nameService.requestTransfer(name, callerAccountObj, fromAddress, toAddress);
  };
}

export function postForSale(name, callerAddress, amount) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[callerAddress];
    const callerAccountObj = {
      address: callerAddress,
      privateKey,
    };

    nameService.postForSale(name, callerAccountObj, amount);
  };
}

export function cancelForSale(name, callerAddress) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[callerAddress];
    const callerAccountObj = {
      address: callerAddress,
      privateKey,
    };

    nameService.cancelForSale(name, callerAccountObj);
  };
}

export function acceptSale(name, callerAddress) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[callerAddress];
    const callerAccountObj = {
      address: callerAddress,
      privateKey,
    };

    nameService.acceptSale(name, callerAccountObj, callerAddress);
  };
}

export function postOffer(name, callerAddress, amount) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[callerAddress];
    const callerAccountObj = {
      address: callerAddress,
      privateKey,
    };

    nameService.postOffer(name, callerAccountObj, amount);
  };
}

export function cancelOffer(name, callerAddress) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[callerAddress];
    const callerAccountObj = {
      address: callerAddress,
      privateKey,
    };

    nameService.cancelOffer(name, callerAccountObj);
  };
}

export function acceptOffer(name, callerAddress, newOwnerAddress) {
  return (dispatch, getState) => {
    const {wallets} = getState().neo;
    const privateKey = wallets[callerAddress];
    const callerAccountObj = {
      address: callerAddress,
      privateKey,
    };

    nameService.acceptOffer(name, callerAccountObj, newOwnerAddress);
  };
}
