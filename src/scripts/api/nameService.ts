import Neon, { u, wallet, sc, api, rpc } from '@cityofzion/neon-js';
import { readInvoke, invoke } from '../api/contract';
import { nep5Tokens } from '../constants/test';
import { getNet } from './net';

export function queryName(name): Promise<any> {
  const method = 'nameServiceQuery';
  const parsedName = sc.ContractParam.string(name);
  const honsTokenAddress = nep5Tokens.hons;

  return readInvoke(honsTokenAddress, method, [parsedName])
  .then(res => {
    if (Boolean(res)) {
      res = u.reverseHex(res);
      res = wallet.getAddressFromScriptHash(res);
    }
    // return res;
  });
}

export function queryAddress(address): Promise<any> {
  const method = 'nameServiceQueryAddress';
  const parsedAddress = sc.ContractParam.byteArray(address, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  return readInvoke(honsTokenAddress, method, [parsedAddress])
  .then(res => {
    if (res) {
      let items = deserializeBytearray(res);
      return items.map(item => u.hexstring2str(String(item)));
    }
  });
}

export function register(name, addressObj) {
  const method = 'nameServiceRegister';
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(addressObj.address, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  invoke(addressObj, honsTokenAddress, method, [parsedName, scFromAddress]);
}

export function unregister(name, addressObj) {
  const method = 'nameServiceUnregister';
  const parsedName = sc.ContractParam.string(name);
  const honsTokenAddress = nep5Tokens.hons;
  invoke(addressObj, honsTokenAddress, method, [parsedName]);
}

export function transfer(name, callerAccountObj, fromAddress, toAddress) {
  const method = 'nameServiceTransfer';
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(fromAddress, 'address');
  const scToAddress = sc.ContractParam.byteArray(toAddress, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  invoke(callerAccountObj, honsTokenAddress, method, [parsedName, scFromAddress, scToAddress], [], 1);
}

export function preApproveTransfer(name, callerAccountObj, fromAddress, toAddress) {
  const method = 'nameServicePreApproveTransfer';
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(fromAddress, 'address');
  const scToAddress = sc.ContractParam.byteArray(toAddress, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  invoke(callerAccountObj, honsTokenAddress, method, [parsedName, scFromAddress, scToAddress]);
}

export function requestTransfer(name, callerAccountObj, fromAddress, toAddress) {
  const method = 'nameServiceRequestTransfer';
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(fromAddress, 'address');
  const scToAddress = sc.ContractParam.byteArray(toAddress, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  invoke(callerAccountObj, honsTokenAddress, method, [parsedName, scFromAddress, scToAddress]);
}

// 01020103636174010463617431
function deserializeBytearray(data) {
  let mutatedData = data;
  const collection_length_length = Number(mutatedData.slice(0, 2));
  mutatedData = mutatedData.slice(2);

  // # get length of collection
  const collection_len = Number(mutatedData.slice(0, collection_length_length + 1));
  mutatedData = mutatedData.slice(collection_length_length + 1);

  // # create a new collection
  const new_collection = [];

  for (let i = 0; i < collection_len; i++) {

    // # get the data length length
    const itemlen_len = Number(mutatedData.slice(0, 2));
    mutatedData = mutatedData.slice(2);

    // # get the length of the data
    const item_len = Number(mutatedData.slice(0, itemlen_len + 1)) * 2;
    mutatedData = mutatedData.slice(itemlen_len + 1);

    // # get the data
    const item = Number(mutatedData.slice(0, item_len));
    console.log(itemlen_len, item_len, item, mutatedData);
    mutatedData = mutatedData.slice(item_len);
    console.log(itemlen_len, item_len, item, mutatedData);

    // # store it in collection
    new_collection.push(item);

  }

  return new_collection;
}
