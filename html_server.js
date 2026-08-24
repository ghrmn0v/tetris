function start_html_server() {
    const http = require('http');
    const fs = require('fs');
    const path = require('path');

    const hostname = '0.0.0.0';
    const port = 8080;

    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ico': 'image/x-icon'
    };

    const server = http.createServer(function(request, response) {
        let filePath = '.' + request.url;

        if (filePath === './') {
            filePath = './index.html';
        }

        let extname = path.extname(filePath);
        let contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, function(error, content) {
            if (error) {
                if (error.code === 'ENOENT') {
                    response.writeHead(404);
                    response.end('404 Not Found');
                } else {
                    response.writeHead(500);
                    response.end('500 Internal Server Error');
                }
            } else {
                response.writeHead(200, { "Content-Type": contentType });
                response.write(content);
                response.end();
            }
        });
    }).listen(port, hostname, () => {
        console.log("Server running at http://web-XXXXXXXXX.docode.YYYY.qwasar.io");
        console.log("Replace XXXXXXXXX by your current workspace ID");
        console.log("(look at the URL of this page and XXXXXXXXX.docode.YYYY.qwasar.io, XXXXXXXXX is your workspace ID and YYYY is your zone)");
    });
}

start_html_server();
