const https = require('http');

const data = JSON.stringify({
  email: "mohamedtash574@gmail.com",
  password: "Dmg159753@#"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/sign-in/email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  console.log('Status:', res.statusCode);
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
