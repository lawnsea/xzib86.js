var console = {};

function sendConsoleMessage() {
    var args = Array.prototype.slice.call(arguments);
    var i;

    postMessage({
        method: 'console',
        params: args
    });
}

console.log = sendConsoleMessage.bind(console, 'log');
console.dir = sendConsoleMessage.bind(console, 'dir');
console.debug = sendConsoleMessage.bind(console, 'debug');
console.info = sendConsoleMessage.bind(console, 'info');
console.warn = sendConsoleMessage.bind(console, 'warn');
console.error = sendConsoleMessage.bind(console, 'error');
console.assert = sendConsoleMessage.bind(console, 'assert');
