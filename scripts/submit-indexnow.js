'use strict';

const https = require('https');

const host = 'www.thinkersgk.com';
const key = '9decf31152cf4527a0947c0c5656121b';
const keyLocation = `https://${host}/${key}.txt`;
const urlList = [
  `https://${host}/`,
  `https://${host}/services.html`,
  `https://${host}/contact.html`,
  `https://${host}/service-device-lifecycle.html`,
  `https://${host}/llms.txt`,
  `https://${host}/sitemap.xml`,
];

const payload = JSON.stringify({ host, key, keyLocation, urlList });

const req = https.request({
  hostname: 'api.indexnow.org',
  path: '/IndexNow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  },
}, (res) => {
  let body = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log(`IndexNow status: ${res.statusCode}`);
    if (body.trim()) console.log(body);
    if (res.statusCode < 200 || res.statusCode >= 300) process.exitCode = 1;
  });
});

req.on('error', (err) => {
  console.error(`IndexNow request failed: ${err.message}`);
  process.exitCode = 1;
});

req.write(payload);
req.end();
