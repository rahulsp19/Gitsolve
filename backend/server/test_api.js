const http = require('http');

const data = JSON.stringify({
  repoUrl: "https://github.com/rahulsp19/Test_repo1"
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('RESPONSE BODY:', body);
  });
});

req.on('error', (e) => {
  console.error(`PROBLEM WITH REQUEST: ${e.message}`);
});

req.write(data);
req.end();
