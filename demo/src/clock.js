importScripts('../../lib/util/compat.js');
importScripts('../../lib/util/worker/console.js');
importScripts('../../lib/xzib86/scheduler.js');

/**
 * We need a reliable timer in the worker, so that we can be reasonable about
 * how we balance computation with event throughput.
 */
 
console.log('HEYO');

var scheduler = new xzib86.Scheduler({
    DURATION: 1000 * 5
});
var last = Date.now();

scheduler.enqueue(function () { /* NOP */ });

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
