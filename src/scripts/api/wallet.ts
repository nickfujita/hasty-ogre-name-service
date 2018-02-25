import Neon, { api } from '@cityofzion/neon-js';
import { getNet } from './net';

export function checkBalance(address: string): Promise<any> {
  // CHECK WALLET BALANCE
  return api.getBalanceFrom({
    net: getNet(),
    address,
  }, api.neonDB)
  .then(balance => {
    // console.log('balance', balance);
    return balance;
  })
  .catch(error => {
    console.log('error', error);
  });
}

export function makeIntents(rawIntents: Intent[]) {
  return rawIntents.reduce((accum, intent) => {
    const {assetAmounts, address} = intent;

    return [
      ...accum,
      ...api.makeIntent(assetAmounts, address),
    ];
  }, []);
}

export function sendAsset(fromAccount: Account, instents: Neon.tx.TransactionOutput[]): Promise<any> {
  // SEND ASSETS
  const config: api.apiConfig = {
    net: getNet(),
    address: fromAccount.address,
    privateKey: fromAccount.privateKey,
    intents: instents,
  };
  console.log('sendAsset; inside;', config);
  return api.sendAsset(config)
  .then((config: api.apiConfig) => {
    console.log('success', config.response);
  })
  .catch(config => {
    console.log('error', config);
  });
}

export function claimGas() {
  // CLAIM GAS
  // const config = {
  //   net: 'http://127.0.0.1:5000',
  //   address: 'AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y',
  //   privateKey: 'KxDgvEKzgSBPPfuVfw67oPQBSjidEiqTHURKSDL1R7yGaGYAeYnr',
  // };
  // api.claimGas(config)
  // .then(config => {
  //   console.log(config.response);
  // })
  // .catch(config => {
  //   console.log(config);
  // });
}

export interface Account {
  address: string;
  privateKey: string;
}

interface Intent {
  assetAmounts: api.AssetAmounts;
  address: string;
}
