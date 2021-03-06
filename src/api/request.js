
import * as ajax from '../lib/ajax'
import createListeners from './createListeners'

import { dom } from '../closure'


const listeners = createListeners();

const api = {
	initialState: [],
	onPluginRequest(state, ...args) {
		state.push(listeners.create(api.onPluginRequest, this.$element, ...args));
	},
	onPluginClick(state, ...args) {
		state.push(listeners.create(api.onPluginClick, this.$element, ...args));
	},
	onPluginSubmit(state, ...args) {
		state.push(listeners.create(api.onPluginSubmit, this.$element, ...args));
	},
	onRequest(state, ...args) {
		state.push(listeners.create(api.onRequest, this.$element, ...args));
	},
	onClick(state, ...args) {
		state.push(listeners.create(api.onClick, this.$element, ...args));
	},
	onSubmit(state, ...args) {
		state.push(listeners.create(api.onSubmit, this.$element, ...args));
	},
	destroy(state) {
		state.splice(0, state.length).forEach(fn => fn());
	}
}

export default api;

export function createClickRequest(e, $link, endpoint) {
	return createRequest(listeners.find(
		[[e, $link, endpoint], api.onPluginClick, onPluginCheck($link)],
		[[e, $link, endpoint], api.onClick, onElementCheck],
		[[$link, endpoint, ''], api.onPluginRequest, onPluginCheck($link)],
		[[$link, endpoint, ''], api.onRequest, onElementCheck]
	));
}

export function createSubmitRequest(e, $form, $submitter, endpoint, data) {
	return createRequest(listeners.find(
		[[e, $form, $submitter, endpoint, data], api.onPluginSubmit, onPluginCheck($form), onFormCheck($form, $submitter)],
		[[e, $form, $submitter, endpoint, data], api.onSubmit, onElementCheck, onFormCheck($form, $submitter)],
		[[$form, endpoint, data], api.onPluginRequest, onPluginCheck($form)],
		[[$form, endpoint, data], api.onRequest, onElementCheck]
	));
}

export function createHttpRequest($element, endpoint, data) {
	return createRequest(listeners.find(
		[[$element, endpoint, data], api.onPluginRequest, onPluginCheck($element)],
		[[$element, endpoint, data], api.onRequest, onElementCheck]
	));
}


function onPluginCheck($requestElement) {
	return function($element, args) {
		if ($requestElement && $element) {
			return dom.contains($element, $requestElement);
		}

		return false;
	}
}


function onElementCheck($element) {
	return !$element || document.contains($element);
}


function onFormCheck($form, $submitter) {
	return function($element, args) {
		const formName = String($form && $form.getAttribute('name'))||'';
		const submitName = String($submitter && $submitter.getAttribute('name'))||'';

		const names = [
			formName,
			formName + ':' + submitName,
			formName + '[' + submitName + ']',
			':' + submitName,
		];

		if (typeof args[0]==='string' && args[0]!=='*' && names.indexOf(args[0])===-1) {
			return false;

		} else if (typeof args[1]==='string' && args[1]!==submitName) {
			return false;
		}

		return true;
	}
}


function createRequest(_listeners) {
	for (let listenerObj of _listeners) {
		const { listener, typeArgs } = listenerObj;

		try {
			listenerObj.result = listener.handler(...typeArgs);

		} catch(e) {
			console.error(e);
		}
	}

	const callListeners = function(method, ...args) {
		let ret = false;
		for (let { result, listener } of _listeners) {
			if (result && result[method] && listeners.contains(listener)) {
				try {
					if (result[method](...args)) {
						ret = true;
					}

				} catch(e) {
					console.error(e);
				}
			}
		}

		return ret;
	}

	return {
		prevented() { callListeners('prevented'); },
		onResponse(status, response, isLast) {
			callListeners('onResponse', status, response, isLast);

			switch (status) {
				case ajax.ABORT: callListeners('onAbort', response, isLast); break;
				case ajax.TIMEOUT: callListeners('onTimeout', response, isLast); break;
				case ajax.ERROR: callListeners('onError', response, isLast); break;
				case ajax.SUCCESS: callListeners('onSuccess', response, isLast); break;
			}
		},
		onResponseLeave(endpoint) { return callListeners('onResponseLeave', endpoint); },
		onResponseCanonize(endpoint) { return callListeners('onResponseCanonize', endpoint); },
		onResponseRedirect(endpoint) { return callListeners('onResponseRedirect', endpoint); },
		onResponseUpdate() { return callListeners('onResponseUpdate'); },
		onResponseSwap(request) { return callListeners('onResponseSwap', request); },
		onComplete(isLast) { callListeners('onComplete', isLast); },
	}
}
