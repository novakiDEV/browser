const { protocol } = require('electron');

function registerProtocols() {
  protocol.registerStringProtocol('cnvrs', (request, callback) => {
    // Return a blank page
    callback({ mimeType: 'text/html', data: '' });
  });
}

module.exports = { registerProtocols };
