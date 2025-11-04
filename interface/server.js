#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
};

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/index.html' : req.url;

    console.log('Request:', req.url);

    // Handle paths for data files (they are in parent directory)
    if (filePath.startsWith('/data/')) {
        filePath = path.join(__dirname, '..', filePath);
        console.log('Resolved data path:', filePath);
    } else {
        filePath = path.join(__dirname, filePath);
        console.log('Resolved interface path:', filePath);
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('File read error:', err.code, filePath);
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found: ' + filePath);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 Taxonomy Inspector running at http://localhost:${PORT}`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
});
