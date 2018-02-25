import {
  ADD_WALLET,
  REMOVE_WALLET,
} from '../constants/actions';

export function addWallet(address, privateKey) {
  return {
    type: ADD_WALLET,
    data: {
      address,
      privateKey,
    },
  };
}

export function removeWallet(address) {
  return {
    type: REMOVE_WALLET,
    data: address,
  };
}
