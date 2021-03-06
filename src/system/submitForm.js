
import closure from '../closure'


export default function create() {
	let _submitterEvent, _releaseClick, _releaseKey;
	const dispatch = this.dispatch.bind(this);

	const onClick = function onClick(e) {
		clearTimeout(_releaseClick);
		_releaseClick = setTimeout(function() { _submitterEvent = null }, 250);
		_submitterEvent = e;
	}

	const onKeyDown = function onKeyDown(e) {
		if (e.keyCode === 13) {
			clearTimeout(_releaseKey);
			_releaseKey = setTimeout(function() { _submitterEvent = null; }, 300);
			_submitterEvent = e;
		}
	}

	const onSubmit = function onSubmit(e) {
		const _$form = e.target;
		const _$submitter = _submitterEvent && closure.dom.getSubmitter(_$form, _submitterEvent);
		const _toTarget = (function() {
			if (_submitterEvent && (_submitterEvent.metaKey || _submitterEvent.ctrlKey)) {
				return '_blank';

			} else if (_$submitter && _$submitter.getAttribute('formtarget')) {
				return _$submitter.getAttribute('formtarget');

			} else if (_$submitter && _$submitter.getAttribute('data-target')) {
				return _$submitter.getAttribute('data-target');

			} else if (e.target && e.target.getAttribute('target')) {
				return e.target.getAttribute('target');

			} else if (e.target && e.target.getAttribute('data-target')) {
				return e.target.getAttribute('data-target');
			}

			return '';
		})();

		if (!e.defaultPrevented) {
			dispatch('app.event', 'submit', e, _$form, _$submitter, _toTarget);
		}
	}

	const submit = HTMLFormElement.prototype.submit;
	HTMLFormElement.prototype.submit = function() {
		let event = null;
		try {
			event = new Event('submit', {bubbles: true, cancelable: true, target: this, srcElement: this});

		} catch (e) {
			event = document.createEvent('Event');
			event.initEvent('submit', true, true);
		}

		const preventDefault = event.preventDefault && event.preventDefault.bind(event);
		let defaultPrevented = false;
		event.preventDefault = function() {
			defaultPrevented = true;
			preventDefault && preventDefault();
		}

		const $form = document.body.contains(this) ? this : this.cloneNode(true);

		if ($form!==this) {
			document.body.appendChild($form);
		}

		$form.dispatchEvent(event);

		if (defaultPrevented===false && !event.defaultPrevented) {
			submit.call($form);
		}

		if ($form!==this) {
			$form.parentNode.removeChild($form);
		}
	}

	this.event(document, 'click', onClick);
	this.event(document, 'keydown', onKeyDown);
	this.event(document, 'submit', onSubmit);

	return function() {
		HTMLFormElement.prototype.submit = submit;
	}
}
