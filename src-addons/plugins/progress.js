
import { classes } from 'appgine/lib/closure'

export const shouldShowRequestProgress = 'shouldShowRequestProgress'


export default function create($root) {
	const plugin = this;
	const $container = document.createElement('div');

	let _visible = false;
	let _requestnum = 0;
	let _animation = $container.animate ? createJSAnimation($container) : createCSSAnimation($root, $container);

	classes.add($root, 'progress');
	$root.appendChild($container);

	this.listen('app.request', 'start', function(endpoint, { $element, requestnum }) {
		_requestnum = Math.max(_requestnum, requestnum);

		let showProgress = true;
		if ($element) {
			for (let method of plugin.findElementMethods(shouldShowRequestProgress, $element)) {
				showProgress = showProgress && method($element);
			}
		}

		if (_visible===false && showProgress) {
			_visible = true;
			_animation.start();
		}
	});

	this.listen('app.request', 'stop', function({ requestnum }) {
		setTimeout(function() {
			if (_visible && requestnum===_requestnum) {
				_visible = false;
				_animation.end();
			}

		}, 100);
	});

	this.listen('app.request', 'leave', function() {});

	this.listen('app.request', 'abort', function() {
		if (_visible) {
			_visible = false;
			_animation.abort();
		}
	});

	return {
		destroy() {
			_animation.destroy();
			$root.removeChild($container);
			classes.remove($root, 'progress');
		},
	}
}


function createCSSAnimation($root, $container)
{
	let _pendingHidden;

	return {
		start() {
			clearTimeout(_pendingHidden);

			classes.remove($root, 'progress-loading');
			classes.remove($root, 'progress-loaded');
			classes.remove($root, 'progress-hidden');

			setTimeout(() => {
				classes.add($root, 'progress-loading');
				$container.style.animationDuration = '';
			}, 0);
		},
		end() {
			classes.remove($root, 'progress-loading');
			$container.style.animationDuration = '';
			classes.add($root, 'progress-loaded');

			_pendingHidden = setTimeout(() => classes.add($root, 'progress-hidden'), 1000);
		},
		abort() {
			classes.remove($root, 'progress-loading');
			$container.style.animationDuration = '';
		},
		destroy() {
			$container.style.animationDuration = '';
			classes.remove($root, 'progress-loading', 'progress-loaded', 'progress-hidden');
		},
	}
}


function createJSAnimation($container)
{
	let _animation = null;

	return {
		start() {
			$container.style.width = '0%';
			$container.style.visibility = '';

			setTimeout(() => {
				_animation && _animation.cancel();
				_animation = $container.animate([
					{width: '5%', offset: 0.0},
					{width: '8%', offset: 0.008},
					{width: '10%', offset: 0.015},
					{width: '15%', offset: 0.025},
					{width: '30%', offset: 0.05},
					{width: '50%', offset: 0.065},
					{width: '60%', offset: 0.08},
					{width: '65%', offset: 0.09},
					{width: '70%', offset: 0.125},
					{width: '75%', offset: 0.15},
					{width: '76%', offset: 0.20},
					{width: '76.5%', offset: 0.25},
					{width: '77%', offset: 0.35},
					{width: '77.5%', offset: 0.50},
					{width: '78%', offset: 0.70},
					{width: '79%', offset: 0.80},
					{width: '79.5%', offset: 0.90},
					{width: '80%', offset: 1.00}
				], {
					duration: 50000,
				});

				_animation.onfinish = function() {
					_animation = undefined;
					$container.style.width = '80%';
				}
			}, 0);
		},
		end() {
			if (!_animation || _animation.finished) {
				this._end();

			} else if (_animation.playbackRate===undefined) {
				_animation.cancel();
				this._end();

			} else {
				_animation.onfinish = this._end;
				_animation.playbackRate = 500;
			}
		},
		abort() {
			$container.style.visibility = 'hidden';
		},
		destroy() {
			_animation && _animation.cancel();
		},
		_end() {
			_animation = $container.animate([
				{width: '80%', offset: 0.0},
				{width: '100%', offset: 0.25},
				{width: '100%', offset: 1.00},
			], {
				duration: 500,
			});

			_animation.onfinish = function() {
				_animation = undefined;
				$container.style.visibility = 'hidden';
			}
		}
	}
}