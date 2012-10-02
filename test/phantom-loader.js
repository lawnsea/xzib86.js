var page = require('webpage').create();

page.open('http://localhost:8080/demo/clock.html', function(status) {
    console.log("Status: " + status);
    // Do other things here...
});

page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log("CONSOLE: " + msg +
        ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

page.onError = function(msg, trace) {
	var msgStack = ["ERROR: " + msg];
	if (trace) {
		msgStack.push("TRACE:");
		trace.forEach(function(t) {
			msgStack.push(" -> " + t.file + ": " + t.line +
                (t.function ? " (in function '" + t.function + "')" : ""));
		});
	}
	console.error(msgStack.join("\n"));
};
