const https = require('https');
https.get('https://api.duckduckgo.com/?q=ios+safari+double+click+active+css&format=json', (resp) => {
  let data = '';
  resp.on('data', (chunk) => data += chunk);
  resp.on('end', () => console.log(data));
});
