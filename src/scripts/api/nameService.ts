import Neon, { u, wallet, sc, api } from '@cityofzion/neon-js';
import { readInvoke, invoke } from '../api/contract';
import { nep5Tokens } from '../constants/test';
import { getNet } from './net';
import { deserializeBytearray } from '../utils/byteArray';

function invokeHons(addressObj, method, params, intents?, gasOverride?) {
  const honsTokenAddress = nep5Tokens.hons;
  invoke(addressObj, honsTokenAddress, method, params, intents, gasOverride);
}

function readInvokeHons(method, params) {
  const honsTokenAddress = nep5Tokens.hons;
  return readInvoke(honsTokenAddress, method, params);
}

export function queryName(name): Promise<any> {
  const method = 'nameServiceQuery';
  const parsedName = sc.ContractParam.string(name);

  return readInvokeHons(method, [parsedName])
  .then(res => {
    if (Boolean(res)) {
      res = u.reverseHex(res);
      res = wallet.getAddressFromScriptHash(res);
    }
    return res;
  });
}

export function queryAddress(address): Promise<any> {
  const method = 'nameServiceQueryAddress';
  const parsedAddress = sc.ContractParam.byteArray(address, 'address');
  return readInvokeHons(method, [parsedAddress])
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
  invokeHons(addressObj, method, [parsedName, scFromAddress]);
}

export function unregister(name, addressObj) {
  const method = 'nameServiceUnregister';
  const parsedName = sc.ContractParam.string(name);
  invokeHons(addressObj, method, [parsedName]);
}

export function transfer(name, callerAccountObj, fromAddress, toAddress) {
  const method = 'nameServiceTransfer';
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(fromAddress, 'address');
  const scToAddress = sc.ContractParam.byteArray(toAddress, 'address');
  invokeHons(callerAccountObj, method, [parsedName, scFromAddress, scToAddress], [], 1);
}

export function preApproveTransfer(name, callerAccountObj, fromAddress, toAddress) {
  const method = 'nameServicePreApproveTransfer';
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(fromAddress, 'address');
  const scToAddress = sc.ContractParam.byteArray(toAddress, 'address');
  invokeHons(callerAccountObj, method, [parsedName, scFromAddress, scToAddress]);
}

export function requestTransfer(name, callerAccountObj, fromAddress, toAddress) {
  const method = 'nameServiceRequestTransfer';
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(fromAddress, 'address');
  const scToAddress = sc.ContractParam.byteArray(toAddress, 'address');
  invokeHons(callerAccountObj, method, [parsedName, scFromAddress, scToAddress]);
}

export function queryForSale(name): Promise<number> {
  const method = 'nameServiceQueryForSale';
  const parsedName = sc.ContractParam.string(name);
  return readInvokeHons(method, [parsedName]);
}

export function postForSale(name, addressObj, amount) {
  const method = 'nameServicePostForSale';
  const parsedName = sc.ContractParam.string(name);
  invokeHons(addressObj, method, [parsedName, amount]);
}

export function cancelForSale(name, addressObj) {
  const method = 'nameServiceCancelForSale';
  const parsedName = sc.ContractParam.string(name);
  invokeHons(addressObj, method, [parsedName]);
}

export function acceptSale(name, addressObj, newOwnerAccount) {
  const method = 'nameServiceAcceptSale';
  const parsedName = sc.ContractParam.string(name);
  const scNewOwnerAccount = sc.ContractParam.byteArray(newOwnerAccount, 'address');
  invokeHons(addressObj, method, [parsedName, scNewOwnerAccount]);
}

export function postOffer(name, addressObj, amount) {
  const method = 'nameServicePostOffer';
  const parsedName = sc.ContractParam.string(name);
  const scNewOwnerAccount = sc.ContractParam.byteArray(addressObj.address, 'address');
  invokeHons(addressObj, method, [parsedName, amount, scNewOwnerAccount]);
}

export function cancelOffer(name, addressObj) {
  const method = 'nameServiceCancelOffer';
  const parsedName = sc.ContractParam.string(name);
  const scNewOwnerAccount = sc.ContractParam.byteArray(addressObj.address, 'address');
  invokeHons(addressObj, method, [parsedName, scNewOwnerAccount]);
}

export function findOffers(name): Promise<any> {
  const method = 'nameServiceFindOffers';
  const parsedName = sc.ContractParam.string(name);
  return readInvokeHons(method, [parsedName])
  .then(res => {
    if (res) {
      let items = deserializeBytearray(res);
      return items.map(item => {
        const scriptHash = u.reverseHex(item);
        return wallet.getAddressFromScriptHash(scriptHash);
      });
    }
  });
}

export function getOffer(name): Promise<number> {
  const method = 'nameServiceGetOffer';
  const parsedName = sc.ContractParam.string(name);
  return readInvokeHons(method, [parsedName]);
}

export function acceptOffer(name, addressObj) {
  const method = 'nameServiceAcceptOffer';
  const parsedName = sc.ContractParam.string(name);
  const scNewOwnerAccount = sc.ContractParam.byteArray(addressObj.address, 'address');
  invokeHons(addressObj, method, [parsedName, scNewOwnerAccount]);
}
