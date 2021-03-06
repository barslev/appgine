
import {
	loadScripts, unloadScripts,
	loadGlobal, reloadStatic, loadAtomic, unloadAtomic
} from './plugins'


export default class Request {


	constructor(endpoint, $fragment, scrollTo) {
		this.created = Date.now();
		this.endpoint = endpoint;
		this.$fragment = $fragment;
		this.formSubmitted = [];

		if (typeof scrollTo === 'string' || typeof scrollTo === 'function') {
			this.scrollTop = 0;
			this.scrolled = scrollTo;

		} else if (scrollTo === false) {
			this.scrollTop = 0;
			this.scrolled = true;

		} else {
			this.scrollTop = parseInt(scrollTo||0, 10);
			this.scrolled = $fragment.querySelector('[data-scrollTo],[data-scrollToEdge]') ? -2 : -1;
		}

		this.redirect = null;
		this.canonize = null;
		this.swap = null;
	}

	scrollToElement($scrollToElement) {
		this.scrollTop = 0;
		this.scrolled = $scrollToElement;
	}

	initialize() {
		loadScripts(this.$fragment);
		loadGlobal(this.$fragment);
		reloadStatic(this.$fragment);
		loadAtomic(this.$fragment, this);
		return this;
	}

	willRedirect(...redirect) { this.redirect = redirect; }
	willCanonize(...canonize) { this.canonize = canonize; }
	willSwap(...swap) { this.swap = swap; }

	dispose() {
		unloadAtomic(this.$fragment, this);
		unloadScripts(this.$fragment);
		this.formSubmitted = null;
		this.redirect = null;
		this.canonize = null;
		this.swap = null;
	}


	shouldReloadForHash(hash) {
		return false;
	}

}
