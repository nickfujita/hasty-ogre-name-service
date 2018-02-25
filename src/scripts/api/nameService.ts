import Neon, { u, wallet, sc, api } from '@cityofzion/neon-js';
import { readInvoke, invoke } from '../api/contract';
import { nep5Tokens } from '../constants/test';

export function queryName(name): Promise<any> {
  const parsedMethod = sc.ContractParam.string('query');
  const parsedName = sc.ContractParam.string(name);
  const honsTokenAddress = nep5Tokens.hons;
  return readInvoke(honsTokenAddress, 'NameServiceInvoke', [parsedMethod, parsedName])
  .then(res => {
    if (Boolean(res)) {
      res = u.reverseHex(res);
      res = wallet.getAddressFromScriptHash(res);
    }
    return res;
  });
}

export function queryAddress(address): Promise<any> {
  const parsedMethod = sc.ContractParam.string('queryAddress');
  const parsedAddress = sc.ContractParam.byteArray(address, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  return readInvoke(honsTokenAddress, 'NameServiceInvoke', [parsedMethod, parsedAddress])
  .then(res => res && res.map && res.map(item => u.hexstring2str(item.value)));
}

export function register(name, addressObj) {
  const parsedMethod = sc.ContractParam.string('register');
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(addressObj.address, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  invoke(addressObj, honsTokenAddress, 'NameServiceInvoke', [parsedMethod, parsedName, scFromAddress]);
}

export function unregister(name, addressObj) {
  const parsedMethod = sc.ContractParam.string('unregister');
  const parsedName = sc.ContractParam.string(name);
  const honsTokenAddress = nep5Tokens.hons;
  invoke(addressObj, honsTokenAddress, 'NameServiceInvoke', [parsedMethod, parsedName]);
}

export function transfer(name, callerAccountObj, fromAddress, toAddress) {
  const parsedMethod = sc.ContractParam.string('transfer');
  const parsedName = sc.ContractParam.string(name);
  const scFromAddress = sc.ContractParam.byteArray(fromAddress, 'address');
  const scToAddress = sc.ContractParam.byteArray(toAddress, 'address');
  const honsTokenAddress = nep5Tokens.hons;
  invoke(callerAccountObj, honsTokenAddress, 'NameServiceInvoke', [parsedMethod, parsedName, scFromAddress, scToAddress], [], 1);
}
