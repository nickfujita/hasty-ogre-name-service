import {
  UPDATE_WALLET_BALANCE,
  UPDATE_TOKEN_NAME,
  UPDATE_TOKEN_SYMBOL,
  UPDATE_TOKEN_TOTAL_SUPPLY,
  UPDATE_TOKEN_DECIMALS,
  UPDATE_NAME_QUERY,
  ADD_WALLET,
  REMOVE_WALLET,
  UPDATE_ADDRESS_NAMES,
} from '../../constants/actions';
import { nep5Tokens } from '../../constants/test';

const storageKey = 'sandbox-wallets';
const initialWalletsRaw = localStorage.getItem(storageKey);
const initialWallets = initialWalletsRaw && JSON.parse(initialWalletsRaw);

// AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y: 'KxDgvEKzgSBPPfuVfw67oPQBSjidEiqTHURKSDL1R7yGaGYAeYnr', // 100m
// AcPcNXsmXZqVCHuup1wRt2dgiLqVBZ1ciU: 'L5aCgCwXDL7oV8VN1xbsM7oT4uQyhqFuGFKaZkqHrbtddCAuJxj7',
// AHp8Hagca8aZyY2VNvL2SPDgZV9aDcJFWF: 'L1MJ1tN6FUF3EZY3hikrZzYawtpUn2NmTfVT76WGyLZSrMmJPbAN',

const initialState = {
  tokens: nep5Tokens,
  wallets: initialWallets || {},
  walletBalances: {},
  walletNames: {},
  token: {
    name: '',
    symbol: '',
    totalSupply: '',
    decimals: '',
  },
};

export default function counter(state = initialState, action) {
  switch (action.type) {
    case UPDATE_WALLET_BALANCE:
      return updateWalletBalance(state, action.data);
    case UPDATE_TOKEN_NAME:
      return {
        ...state,
        token: {
          ...state.token,
          name: action.data,
        },
      };
    case UPDATE_TOKEN_SYMBOL:
      return {
        ...state,
        token: {
          ...state.token,
          symbol: action.data,
        },
      };
    case UPDATE_TOKEN_TOTAL_SUPPLY:
      return {
          ...state,
          token: {
            ...state.token,
            totalSupply: action.data,
          },
        };
    case UPDATE_TOKEN_DECIMALS:
      return {
          ...state,
          token: {
            ...state.token,
            decimals: action.data,
          },
        };
    case UPDATE_NAME_QUERY:
      return {
        ...state,
        nameQuery: action.data,
      };
    case UPDATE_ADDRESS_NAMES:
      return updateWalletNames(state, action.data);
    case ADD_WALLET:
      return addWallet(state, action.data);
    case REMOVE_WALLET:
      return removeWallet(state, action.data);
    default:
      return state;
  }
}

function updateWalletNames(state, data) {
  const {address, names} = data;
  return {
    ...state,
    walletNames: {
      ...state.walletNames,
      [address]: names,
    },
  };
}

function updateWalletBalance(state, data) {
  const {address, assets} = data;
  const currentBalances = state.walletBalances[address] || {};
  return {
    ...state,
    walletBalances: {
      ...state.walletBalances,
      [address]: {
        ...currentBalances,
        ...assets,
      },
    },
  };
}

function addWallet(state, data) {
  const {address, privateKey} = data;
  const {wallets} = state;
  const newWallets = {
    ...wallets,
    [address]: privateKey,
  };

  localStorage.setItem(storageKey, JSON.stringify(newWallets));

  return {
    ...state,
    wallets: newWallets,
  };
}

function removeWallet(state, address) {
  const {wallets} = state;
  const newWallets = {...wallets};
  delete newWallets[address];
  localStorage.setItem(storageKey, JSON.stringify(newWallets));
  return {
    ...state,
    wallets: newWallets,
  };
}
