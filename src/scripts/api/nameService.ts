import Neon, { u, wallet, sc, api } from '@cityofzion/neon-js';
import { readInvoke, invoke } from '../api/contract';
import { nep5Tokens } from '../constants/test';

export function queryName(name): Promise<any> {
  const method = 'nameService' + 'query';
  const parsedName = sc.ContractParam.string(name);
  const honsTokenAddress = nep5Tokens.hons;
  return readInvoke(honsTokenAddress, method, [parsedName])
  .then(res => {
    if (Boolean(res)) {
      res = u.reverseHex(res);
      res = wallet.getAddressFromScriptHash(res);
    }
    return res;
  });
}

export function queryAddress(address): Promise<any> {
  const method = 'nameService' + 'queryAddress';
  const parsedAddress = sc.ContractParam.byteArray(address, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  return readInvoke(honsTokenAddress, method, [parsedAddress])
  .then(res => res && res.map && res.map(item => u.hexstring2str(item.value)));
}

export function register(name, addressObj) {
  const method = 'nameService' + 'register';
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(addressObj.address, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  invoke(addressObj, honsTokenAddress, method, [parsedName, scFromAddress]);
}

export function unregister(name, addressObj) {
  const method = 'nameService' + 'unregister';
  const parsedName = sc.ContractParam.string(name);
  const honsTokenAddress = nep5Tokens.hons;
  invoke(addressObj, honsTokenAddress, method, [parsedName]);
}

export function transfer(name, callerAccountObj, fromAddress, toAddress) {
  const method = 'nameService' + 'transfer';
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(fromAddress, 'address');
  const scToAddress = sc.ContractParam.byteArray(toAddress, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  invoke(callerAccountObj, honsTokenAddress, method, [parsedName, scFromAddress, scToAddress], [], 1);
}

export function preApproveTransfer(name, callerAccountObj, fromAddress, toAddress) {
  const method = 'nameService' + 'preApproveTransfer';
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(fromAddress, 'address');
  const scToAddress = sc.ContractParam.byteArray(toAddress, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  invoke(callerAccountObj, honsTokenAddress, method, [parsedName, scFromAddress, scToAddress]);
}

export function requestTransfer(name, callerAccountObj, fromAddress, toAddress) {
  const method = 'nameService' + 'requestTransfer';
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(fromAddress, 'address');
  const scToAddress = sc.ContractParam.byteArray(toAddress, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  invoke(callerAccountObj, honsTokenAddress, method, [parsedName, scFromAddress, scToAddress]);
}
