const http = require('http');

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    res.writeHead(500);
    res.end();
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(8082, '0.0.0.0', () => {
  console.log('Node proxy running on http://0.0.0.0:8082 forwarding to 127.0.0.1:8000');
});
