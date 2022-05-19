// setup bitcoind rpc
const config = require('./config');
let jayson = require('jayson/promise');
let url = require('url');
if (config.bitcoind) {
  let rpc = url.parse(config.bitcoind.rpc);
  rpc.timeout = 5000;
  let bitcoinclient = jayson.client.http(rpc)
  bitcoinclient.request('createwallet', [config.bitcoind.wallet], function (err, info) {
    if (err && !err.includes("already exists")) {
      console.log('could not create wallet:', err, info);
      process.exit(1);
    }
  });
  bitcoinclient.request('loadwallet', [config.bitcoind.wallet], function (err, info) {
    if (err && !err.includes("already loaded")) {
      console.log('could not load wallet:', err, info);
      process.exit(2);
    }
  });
  rpc = url.parse(config.bitcoind.rpc+'/wallet/'+config.bitcoind.wallet);
  rpc.timeout = 15000;
  module.exports = jayson.client.http(rpc);
} else {
  module.exports = {};
}
