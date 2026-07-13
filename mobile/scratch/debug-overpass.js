const https = require('https');
const fs = require('fs');

const query = `[out:json][timeout:25];way["highway"](40.98,28.76,41.02,28.81);out body;>;out skel qt;`;
const data = "data=" + encodeURIComponent(query);

const options = {
  hostname: 'overpass-api.de',
  port: 443,
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(data),
    'User-Agent': 'Node/14'
  }
};

const req = https.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log('BODY:', body.substring(0, 500)));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
