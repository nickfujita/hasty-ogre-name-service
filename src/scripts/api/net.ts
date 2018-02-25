import { api } from '@cityofzion/neon-js';
let currentNet: api.net = 'TestNet';

export function setNet(newNet: api.net) {
  currentNet = newNet;
}

// http://127.0.0.1:5000
export function getNet(): api.net {
  return currentNet;
}
