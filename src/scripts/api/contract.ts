import Neon, { api, u, rpc, sc, CONST } from '@cityofzion/neon-js';
import { getNet } from './net';
import { Account } from './wallet';

export function readInvoke(scriptHash, operation, rawArgs): Promise<any> {

  const vmScript = createScript(scriptHash, operation, rawArgs);

  return testInvoke(vmScript)
  .then(response => {
    // console.log('success', response);
    const stack = response.result.stack;
    const result = stack[stack.length - 1];
    console.log('success; result', stack.length, stack);
    return result && result.value;
  })
  .catch(error => {
    // console.log('error', error);
  });
}

export function invoke(fromAccount: Account, scriptHash, operation, rawArgs, intents?: Neon.tx.TransactionOutput[], gasOverride = 0) {
  const vmScript = createScript(scriptHash, operation, rawArgs);

  intents = intents || [
    {
      assetId: CONST.ASSET_ID.GAS,
      value: new u.Fixed8(0.00000001),
      scriptHash: u.reverseHex(Neon.get.scriptHashFromAddress(fromAccount.address)),
    },
  ];

  const config: api.apiConfig = {
    net: getNet(),
    address: fromAccount.address,
    privateKey: fromAccount.privateKey,
    script: vmScript,
    gas: gasOverride,
    intents,
  };

  return api.doInvoke(config)
  // once fees kick in, we need to calculate cost of transaction before hand,
  // and pay difference over the initial free 10 gas
  // return testInvoke(vmScript)
  // .then(response => {
  //   console.log('doInvoke; after testInvoke;', response);
  //   config.gas = Number(response.result.gas_consumed);
  //   return api.doInvoke(config);
  // })
  .then((config: api.apiConfig) => {
    // console.log('success', config.response);
  })
  .catch(config => {
    // console.log('error', config);
  });
}

function testInvoke(vmScript) {
  return (api as any).fillUrl({
    net: getNet(),
    address: '',
  })
  .then(config => {
    const script = rpc.Query.invokeScript(vmScript);
    // console.log('invokeScript', config.url);
    const execution = script.execute(config.url);
    // console.log('execute', execution);
    return execution;
  });
}

function createScript(scriptHash, operation, args) {
  // const args = rawArgs.map(arg => u.str2hexstring(arg));
  // const args = rawArgs.map(arg => sc.ContractParam.string(arg));
  const props = {
    scriptHash,
    operation,
    args,
  };
  return Neon.create.script(props);
}
