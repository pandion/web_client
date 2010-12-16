// Making the HTMLElement.prototype writable in old Safari/KHTML.
// http://my.opera.com/_Grey_/blog/2007/04/21/safari-and-htmlelement-prototype
(function () {
	var t, w = window;
	if (!w.HTMLElement && (typeof document.createElement) === "function" // check basics
		&& (t = document.createElement("a").__proto__) // '__proto__' supported?
		&& t === document.createElement("p").__proto__ // all HTMLElements the same?
	) {
		w.HTMLElement = {}; // prevent people from constructing
		w.HTMLElement.prototype = t;
	}
})();

// Based on http://forums.mozillazine.org/viewtopic.php?f=25&t=445587
if (HTMLElement && !("insertAdjacentElement" in HTMLElement.prototype)) {
	HTMLElement.prototype.insertAdjacentElement = function (position, element) {
		switch (position) {
			case "beforeBegin":
				this.parentNode.insertBefore(element, this);
				break;
			case "afterBegin":
				this.insertBefore(element, this.firstChild);
				break;
			case "beforeEnd":
				this.appendChild(element);
				break;
			case "afterEnd":
				if (this.nextSibling) {
					this.parentNode.insertBefore(element, this.nextSibling);
				} else {
					this.parentNode.appendChild(element);
				}
				break;
		}
	};
}

// Based on http://forums.mozillazine.org/viewtopic.php?f=25&t=445587
if (HTMLElement && !("insertAdjacentHTML" in HTMLElement.prototype)) {
	HTMLElement.prototype.insertAdjacentHTML = function (position, html) {
		var range = this.ownerDocument.createRange();
		if (this !== document.body) {
			range.setStartBefore(this);
		}
		var fragment = range.createContextualFragment(html);
		this.insertAdjacentElement(position, fragment);
	};
}

// Based on http://forums.mozillazine.org/viewtopic.php?f=25&t=445587
if (HTMLElement && !("insertAdjacentText" in HTMLElement.prototype)) {
	HTMLElement.prototype.insertAdjacentText = function (position, text) {
		this.insertAdjacentElement(position, document.createTextNode(text));
	};
}
