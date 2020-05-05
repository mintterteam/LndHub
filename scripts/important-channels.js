const important_channels = {
  '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f': {
    name: 'ACINQ',
    uri: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f@34.239.230.56:9735',
  },
  '03abf6f44c355dec0d5aa155bdbdd6e0c8fefe318eff402de65c6eb2e1be55dc3e': {
    name: 'OpenNode',
    uri: '03abf6f44c355dec0d5aa155bdbdd6e0c8fefe318eff402de65c6eb2e1be55dc3e@18.221.23.28:9735',
    wumbo: 1,
  },
  '0242a4ae0c5bef18048fbecf995094b74bfb0f7391418d71ed394784373f41e4f3': {
    name: 'coingate.com',
    uri: '0242a4ae0c5bef18048fbecf995094b74bfb0f7391418d71ed394784373f41e4f3@3.124.63.44:9735',
  },
  '0254ff808f53b2f8c45e74b70430f336c6c76ba2f4af289f48d6086ae6e60462d3': {
    name: 'bitrefill thor',
    uri: '0254ff808f53b2f8c45e74b70430f336c6c76ba2f4af289f48d6086ae6e60462d3@52.30.63.2:9735',
    wumbo: 1,
  },
  '030c3f19d742ca294a55c00376b3b355c3c90d61c6b6b39554dbc7ac19b141c14f': {
    name: 'bitrefill 2',
    uri: '030c3f19d742ca294a55c00376b3b355c3c90d61c6b6b39554dbc7ac19b141c14f@52.50.244.44:9735',
    wumbo: 1,
  },
  '025f1456582e70c4c06b61d5c8ed3ce229e6d0db538be337a2dc6d163b0ebc05a5': {
    name: 'paywithmoon.com',
    uri: '025f1456582e70c4c06b61d5c8ed3ce229e6d0db538be337a2dc6d163b0ebc05a5@52.86.210.65:9735',
  },
  '0279c22ed7a068d10dc1a38ae66d2d6461e269226c60258c021b1ddcdfe4b00bc4': {
    name: 'ln1.satoshilabs.com',
    uri: '0279c22ed7a068d10dc1a38ae66d2d6461e269226c60258c021b1ddcdfe4b00bc4@157.230.28.160:9735',
  },
  '02004c625d622245606a1ea2c1c69cfb4516b703b47945a3647713c05fe4aaeb1c': {
    name: 'LivingRoomOfSatoshi',
    uri: '02004c625d622245606a1ea2c1c69cfb4516b703b47945a3647713c05fe4aaeb1c@172.81.178.151:9735',
  },
  '02816caed43171d3c9854e3b0ab2cf0c42be086ff1bd4005acc2a5f7db70d83774': {
    name: 'ln.pizza aka fold',
    uri: '02816caed43171d3c9854e3b0ab2cf0c42be086ff1bd4005acc2a5f7db70d83774@35.238.153.25:9735',
    wumbo: 1,
  },
  '0331f80652fb840239df8dc99205792bba2e559a05469915804c08420230e23c7c': {
    name: 'LightningPowerUsers.com',
    uri: '0331f80652fb840239df8dc99205792bba2e559a05469915804c08420230e23c7c@34.200.181.109:9735',
  },
  '033d8656219478701227199cbd6f670335c8d408a92ae88b962c49d4dc0e83e025': {
    name: 'bfx-lnd0',
    uri: '033d8656219478701227199cbd6f670335c8d408a92ae88b962c49d4dc0e83e025@34.65.85.39:9735',
  },
};

let lightning = require('../lightning');

lightning.listChannels({}, function(err, response) {
  console.log();
  if (err) {
    console.error('lnd failure:', err);
    return;
  }
  let lightningListChannels = response;
  for (let channel of lightningListChannels.channels) {
    if (channel.capacity < 0.05 / 100000000) {
      console.log(
        'lncli closechannel',
        channel.channel_point.replace(':', ' '),
        (!channel.active && '--force') || '',
        '; sleep 10 #',
        'low capacity channel',
        channel.capacity / 100000000,
        'btc',
      );
    }
  }

  if (process.argv.includes('--reconnect')) {
    console.log('# reconnect important channels that are inactive:\n');
    for (const important of Object.keys(important_channels)) {
      for (let channel of lightningListChannels.channels) {
        if (channel.remote_pubkey === important && !channel.active) {
          console.log(
            'lncli disconnect',
            channel.remote_pubkey,
            '; sleep 5;',
            'lncli connect',
            important_channels[channel.remote_pubkey].uri,
            '#',
            important_channels[channel.remote_pubkey].name,
          );
        }
      }
    }
  }

  if (process.argv.includes('--open')) {
    console.log('\n# open important channels:\n');
    for (const important of Object.keys(important_channels)) {
      let atLeastOneChannelIsSufficientCapacity = false;
      for (let channel of lightningListChannels.channels) {
        if (channel.remote_pubkey === important && channel.local_balance >= 4000000 && channel.active) {
          atLeastOneChannelIsSufficientCapacity = true;
        }
      }

      if (!atLeastOneChannelIsSufficientCapacity) {
        console.log(
          'lncli disconnect',
          important,
          '; sleep 3;',
          'lncli  openchannel --node_key',
          important,
          '--connect',
          important_channels[important].uri.split('@')[1],
          '--local_amt',
          important_channels[important].wumbo ? '167772150' : '16777215',
          '#',
          important_channels[important].name,
        );
      }
    }
  }

  process.exit();
});
