importScripts('../../lib/util/compat.js');
importScripts('../../lib/util/worker/console.js');
importScripts('../../lib/xzib86/scheduler.js');
 
console.log('HEYO');

var memory = new ArrayBuffer(32 * 1024 * 1024);
var VIDEO_BASE = 0xA000;
var VIDEO_WIDTH = 320;
var VIDEO_HEIGHT = 200;
var VIDEO_LEN = VIDEO_WIDTH * VIDEO_HEIGHT;
var videoMemory = new Uint32Array(memory, VIDEO_BASE, VIDEO_LEN);

var scheduler = new xzib86.Scheduler({
    DURATION: 1000 * 30
});
var last = Date.now();

var i = 0;
var c = 0xFF;
var mask = 0xFF << 24;

function plot(x, y, c) {
    videoMemory[y * VIDEO_WIDTH + x] = c;
}

function value(x, y, buf) {
    buf = buf || videoMemory;
    return buf[y * VIDEO_WIDTH + x];
}

function redValue(x, y, buf) {
    buf = buf || videoMemory;
    return 0xFF & buf[y * VIDEO_WIDTH + x];
}

for (i = 0; i < videoMemory.length; i++) {
    videoMemory[i] = mask;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

scheduler.enqueue(function () {
    var prev = new Uint32Array(
        memory.slice(VIDEO_BASE, VIDEO_BASE + (VIDEO_LEN + 1) * 4));
    var x, y, r, c;

    if (!drawn) {
        for (y = VIDEO_HEIGHT - 2; y > 1; y--) {
            for (x = 2; x < VIDEO_WIDTH - 2; x++) {
                c = redValue(x - 2, y + 1, prev) / 8 +
                    redValue(x - 1, y + 1, prev) / 4 +
                    redValue(x, y + 1, prev) / 2 + 
                    redValue(x + 1, y + 1, prev) / 4 +
                    redValue(x + 2, y + 1, prev) / 8;
                c *= 0.75;

                plot(x, y, mask | (0xFF & c));
            }
        }

        var l;
        x = 0;
        while (x < VIDEO_WIDTH) {
            l = randInt(5, 15);
            r = mask | randInt(100, 255);
            for (var i = 0; i < l && x + i < VIDEO_WIDTH; i++) {
                plot(x + i, VIDEO_HEIGHT - 1, r);
                plot(x + i, VIDEO_HEIGHT - 2, r - 1);
            }
            x += l;
        }
    }
});

var drawn = false;
scheduler.on('tick', function () {
    drawn = false;
    postMessage({
        method: 'blit',
        params: [memory.slice(VIDEO_BASE, VIDEO_BASE + VIDEO_LEN * 4)]
    });
});

scheduler.on('stop', function (stats) {
    console.log('\n', scheduler.config.numTickers, 'workers');
    console.log('Calculated for', stats.calcTime, 'ms');
    console.log('Missed', stats.missedTime, 'ms');
    console.log((100 * stats.missedTime / (stats.calcTime + stats.missedTime)).
                toFixed(2), '%');
    console.log('\nCycles', stats.cycles);
    console.log((1000 * (stats.cycles / stats.elapsed)).toFixed(2), 'cycles/s');
    console.log('\n', stats.ticks, 'ticks');
    console.log('\n', (1000 * (stats.ticks / stats.elapsed)).toFixed(2), 'Hz');
});

scheduler.start();
