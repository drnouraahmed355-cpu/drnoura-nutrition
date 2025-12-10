const https = require('http');

const data = JSON.stringify({
  secret: "SEjWQGH96j34BF2mD3kZChYQbtr8lIuG3u/M+4SufcQ=",
  email: "mohamedtash574@gmail.com",
  password: "Dmg159753@#",
  action: "create_admin"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/reset-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
