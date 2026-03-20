const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
});

req.on('error', error => {
  console.error(error);
});

req.end();
