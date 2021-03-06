
var uid = 0;
var timers = {};


const workerHandler = `function (e) {
	if (e.data) {
		var action = e.data.action;
		var type = e.data.type;
		var uid = e.data.uid;
		var timeout = e.data.timeout;

		if (action && type && uid) {
			self['worker_timers'] = self['worker_timers'] || {};

			if (e.data.action === 'start') {
				self['worker_timers'][uid] = (type==='interval' ? setInterval : setTimeout)(function() { self.postMessage(uid) }, timeout);

			} else if (e.data.action === 'stop') {
				if (self['worker_timers'][uid]) {
					(type==='interval' ? clearInterval : clearTimeout)(self['worker_timers'][uid]);
				}
			}
		}
	}
}`;

let worker;
function getWorker() {
	if (worker) {
		return worker;

	} else if (window.Worker && (window.URL || window.webkitURL)) {
		worker = new Worker((window.URL || window.webkitURL).createObjectURL(new Blob(["self.addEventListener('message', " + workerHandler + ");"])));
		worker.addEventListener('message', function(e) {
			if (timers[e.data]) {
				timers[e.data]();
			}
		});

		return worker;
	}

	return null;
}



export function setInterval(cb, timeout) {
	if (getWorker()) {
		uid++;
		timers[uid] = cb;
		getWorker().postMessage({action: "start", type: "interval", uid, timeout});
		return uid;

	} else {
		return setInterval(cb, timeout);
	}
}


export function clearInterval(uid) {
	if (getWorker()) {
		if (timers[uid]!==undefined) {
			delete timers[uid];
			if (--counter===0) getWorker().postMessage({action: "stop", type: "interval", uid});
		}

	} else {
		return clearInterval(uid);
	}
}


export function setTimeout(cb, timeout) {
	if (getWorker()) {
		uid++;
		timers[uid] = cb;
		getWorker().postMessage({action: "start", type: "timeout", uid, timeout});
		return uid;

	} else {
		return setTimeout(cb, timeout);
	}
}


export function clearTimeout(uid) {
	if (getWorker()) {
		if (timers[uid]!==undefined) {
			delete timers[uid];
			if (--counter===0) getWorker().postMessage({action: "stop", type: "timeout", uid});
		}

	} else {
		return clearTimeout(uid);
	}
}
