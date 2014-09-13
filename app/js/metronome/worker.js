// global timeout
var timeout = null;

// timer worker
function timer() {
	postMessage('tick');
	setTimeout(timer, timeout);
}

// on message received
onmessage = function (e) {
	// update timeout
	timeout = e.data.timeout;
	
	// if start command, run timer
	if (e.data.cmd == 'start') {
		timer();
	}
};