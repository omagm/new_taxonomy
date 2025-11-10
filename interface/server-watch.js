#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
};

// WebSocket clients for live reload
const clients = new Set();

// Create WebSocket server
const server = http.createServer((req, res) => {
    // Handle SSE for live reload
    if (req.url === '/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        clients.add(res);

        req.on('close', () => {
            clients.delete(res);
        });

        return;
    }

    let filePath = req.url === '/' ? '/index.html' :
                   req.url === '/enums' ? '/enums.html' : req.url;

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
            // Inject live reload script into HTML
            if (ext === '.html') {
                data = data.toString().replace('</body>', `
                    <script>
                        const eventSource = new EventSource('/events');
                        eventSource.onmessage = (event) => {
                            console.log('Reloading due to data change...');
                            window.location.reload();
                        };
                    </script>
                    </body>
                `);
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

// Watch for changes in data directory
const dataPath = path.join(__dirname, '..', 'data');
console.log('Watching for changes in:', dataPath);

const watcher = chokidar.watch(dataPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
});

watcher
    .on('change', (filepath) => {
        console.log(`File changed: ${filepath}`);
        notifyClients();
    })
    .on('add', (filepath) => {
        console.log(`File added: ${filepath}`);
        notifyClients();
    })
    .on('unlink', (filepath) => {
        console.log(`File removed: ${filepath}`);
        notifyClients();
    });

function notifyClients() {
    clients.forEach((client) => {
        client.write('data: reload\n\n');
    });
}

server.listen(PORT, () => {
    console.log(`\n🚀 Taxonomy Inspector running at http://localhost:${PORT}`);
    console.log(`📁 Watching for changes in: ${dataPath}`);
    console.log(`🔄 Auto-reload enabled`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    watcher.close();
    server.close();
    process.exit(0);
});
