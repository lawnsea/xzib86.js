importScripts('../../lib/events.js');
(function () {
this.xzib86 = this.xzib86 || {};

function Scheduler(config) {
    this.config = config = config || {};
    config.numTickers = config.numTickers || 3;
    config.sliceDuration = config.sliceDuration || 15;

    this.stats = {
        start: null,
        elapsed: null,
        ticks: 0,
        cycles: 0,
        calcTime: 0,
        missedTime: 0
    };
    this._queue = [];
    this._queue.index = 0;
    this._tickers = [];
}

Scheduler.prototype = new events.EventEmitter();
Scheduler.prototype.constructor = Scheduler;

Scheduler.prototype._tickFn = function tickFn (n) {
    var now = Date.now();
    this.stats.ticks++;

    this.stats.missedTime += now - this.stats._lastEnd;

    if (this.config.DURATION && now < this.stats.start + this.config.DURATION) {
        this._tickers[n] = setTimeout(this._tickFn.bind(this, n), 0);
    } else {
        // time has expired and the last ticker has run
        this.stop();
    }

    var sliceStart = now;
    var q = this._queue;
    while (now - sliceStart < this.config.sliceDuration) {
        now = Date.now();
        this.stats.cycles++;

        q[q.index]();
        q.index = (q.index + 1) % q.length;
    }

    this.stats.elapsed += now - this.stats._lastEnd;
    this.stats._lastEnd = now;
    this.stats.calcTime += now - sliceStart;
    this.emit('tick');
};

Scheduler.prototype.enqueue = function enqueue (fn) {
    this._queue.push(fn);
};

Scheduler.prototype.start = function start () {
    this.stats.start = Date.now();
    this.stats.elapsed = 0;
    this.stats.cycles = 0;
    this.stats.calcTime = 0;
    this.stats.missedTime = 0;
    this.stats._lastEnd = this.stats.start;

    for (var n = 0; n < this.config.numTickers; n++) {
        setTimeout(this._tickFn.bind(this, n), 0);
    }

    this.emit('start');
};

Scheduler.prototype.stop = function stop () {
    for (var i = 0; i < this._tickers.length; i++) {
        clearTimeout(this._tickers[i]);
    }

    this.emit('stop', this.stats);
};

this.xzib86.Scheduler = Scheduler;
}());
