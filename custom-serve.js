'use strict';

const fs = require('fs');
const express = require('express');
const cluster = require('express-cluster');
const fastbootMiddleware = require('fastboot-express-middleware');

const heapdump = require('heapdump');
const memwatch = require('memwatch-next');
memwatch.on('leak', (info) => { console.error(`MEMORY LEAK - INFO: ${JSON.stringify(info)}`); });
memwatch.on('stats', (stats) => { console.log(`V8 GC - STATS: ${JSON.stringify(stats)}`); });

var assetPath = 'dist';
var port = process.env.PORT || 3000;

console.log('Booting Ember app...');

try {
  fs.accessSync(assetPath, fs.F_OK);
} catch (e) {
  console.error(`The asset path ${assetPath} does not exist.`);
  process.exit(1);
}

console.log('Ember app booted successfully.');

cluster(function() {
  var app = express();
  var fastboot = fastbootMiddleware(assetPath);

  if (assetPath) {
    app.get('/', fastboot);
  }

  app.get('/*', fastboot);

  var listener = app.listen(port, function() {
    var host = listener.address().address;
    var port = listener.address().port;
    var family = listener.address().family;

    if (family === 'IPv6') { host = '[' + host + ']'; }

    console.log('Ember FastBoot running at http://' + host + ":" + port);
  });
}, { verbose: true, count: 1, resilient: true });