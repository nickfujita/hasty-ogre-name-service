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
      return items.map(item => u.hexstring2str(item));
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
  return readInvokeHons(method, [parsedName])
  .then(u.fixed82num);
}

export function postForSale(name, addressObj, amount) {
  const method = 'nameServicePostForSale';
  const parsedName = sc.ContractParam.string(name);
  const parsedAmount = sc.ContractParam.byteArray(amount, 'fixed8');
  invokeHons(addressObj, method, [parsedName, parsedAmount]);
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
  const parsedAmount = sc.ContractParam.byteArray(amount, 'fixed8');
  const scNewOwnerAccount = sc.ContractParam.byteArray(addressObj.address, 'address');
  invokeHons(addressObj, method, [parsedName, parsedAmount, scNewOwnerAccount]);
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
        debugger;
        // const scriptHash = u.reverseHex(item);
        return wallet.getAddressFromScriptHash(item);
      });
    }
  })
  .then(offerAddresses => {
    debugger;
    return offerAddresses && offerAddresses.map(address => {
      return getOffer(name, address)
      .then(amount => [address, amount]);
    });
  })
  .then(offers => {
    return offers && offers.reduce((accum, offer) => {
      accum[offer[0]] = offer[1];
      return accum;
    }, {});
  });
}

export function getOffer(name, address): Promise<number> {
  const method = 'nameServiceGetOffer';
  const parsedName = sc.ContractParam.string(name);
  const parsedAddress = sc.ContractParam.byteArray(address, 'address');
  return readInvokeHons(method, [parsedName, parsedAddress])
  .then(res => {
    debugger;
    return u.fixed82num(res);
  });
}

export function acceptOffer(name, addressObj, newOwnerAddress) {
  const method = 'nameServiceAcceptOffer';
  const parsedName = sc.ContractParam.string(name);
  const scNewOwnerAddress = sc.ContractParam.byteArray(newOwnerAddress, 'address');
  invokeHons(addressObj, method, [parsedName, scNewOwnerAddress]);
}
