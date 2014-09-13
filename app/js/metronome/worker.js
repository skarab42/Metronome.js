var timeout = null;

function sheduler() {
	postMessage('tick');
	setTimeout(sheduler, timeout);
}

onmessage = function (e) {
	timeout = e.data;
	sheduler();
};