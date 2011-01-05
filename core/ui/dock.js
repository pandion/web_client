define(
["core/css", "libraries/mustache", "text!templates/dock.mustache"],
function (css, mustache, dockTemplate) {
	var setValue = function (element, value) {
		if (typeof value === "string") {
			element.textContent = value;
		} else {
			while (element.hasChildNodes()) {
				element.removeChild(element.firstChild);
			}
			element.appendChild(value);
		}
	};
	var defaults = {
		active: false,
		visible: true,
		close: true,
		toggle: true,
		sticky: false,
		position: -1,
		title: "",
		content: ""
	};
	var docklets = [];
	/*
		descriptor: {
			active: Boolean,
			close: Boolean,
			position: Number,
			sticky: Boolean,
			toggle: Boolean,
			visible: Boolean,
			events: {
				open: fn(api),
				close: fn(api),
				toggle: fn(api),
				active: fn(api)
			}
		}
	*/
	return function (descriptor) {
		var fireEvent = function (type) {
			if (descriptor.events && (typeof descriptor.events[type] === "function")) {
				descriptor.events[type](api);
			}
		};

		var api = {
			get visible () {
				return container.classList.contains("visible") &&
					  !container.querySelector("section.content").classList.contains("hide")
			},
			set visible (state) {
				// Hide all other non-sticky docklets
				if (state) {
					docklets.forEach(function (docklet) {
						if (docklet !== api && !docklet.sticky && docklet.visible) {
							docklet.visible = false;
						}
					});
				}
				if (!state && api.active) {
					api.active = false;
				}
				container.querySelector("section.content").classList[state ? "remove" : "add"]("hide");
				container.classList[state ? "add" : "remove"]("visible");
				fireEvent("toggle");
			},

			get active () {return container.classList.contains("active")},
			set active (state) {
				if (state && !api.visible) {
					api.visible = true;
				}
				if (state && !api.active) {
					container.classList.add("active");
					container.classList.remove("attention");
					fireEvent("active");
					if (descriptor.events) {
						delete descriptor.events.active;
					}
				} else {
					container.classList.remove("active");
				}
			},

			get close () {return !container.querySelector(".close").classList.contains("hide")},
			set close (state) {
				container.querySelector(".close").classList[state ? "remove" : "add"]("hide");
			},

			get toggle () {return container.querySelector(".close").classList.contains("toggle")},
			set toggle (state) {
				container.querySelector(".close").classList[state ? "add" : "remove"]("toggle");
			},

			get sticky () {return container.classList.contains("sticky")},
			set sticky (state) {
				container.classList[state ? "add" : "remove"]("sticky");
			},

			get position () {
				var children = container.parentNode.childNodes;
				for (var i = 0; i < children.length; i++) {
					if (children.item(i) === container) {
						return i;
					}
				}
				return -1;
			},
			set position (index) {
				var children = container.parentNode.childNodes;
				if (typeof index !== "number" || index >= children.length) {
					container.parentNode.insertAdjacentElement("beforeEnd", container);
				} else if (index <= 0) {
					container.parentNode.insertAdjacentElement("afterBegin", container);
				} else {
					children.item(parseInt(index)).insertAdjacentElement("beforeBegin", container);
				}
			},

			get title () {return container.querySelector(".title")},
			set title (title) {
				setValue(api.title, title || "");
			},

			get content () {return container.querySelector(".content")},
			set content (content) {
				setValue(api.content, content || "");
			},

			attention: function (callback) {
				if (api.active) {
					callback(api);
				} else {
					if (!descriptor.events) {
						descriptor.events = {};
					}
					descriptor.events.active = callback;
					container.classList.add("attention");
				}
			},

			remove: function () {
				container.parentNode.removeChild(container);
				fireEvent("close");
			}
		};

		css.load("core/ui/dock");
		var offscreen = document.createElement("p");
		offscreen.insertAdjacentHTML("beforeEnd", mustache.to_html(dockTemplate));
		var container = offscreen.firstChild;
		document.querySelector("#dock menu").insertAdjacentElement("beforeEnd", container);
		container.querySelector(".tab").addEventListener("click", function (event) {
			if (api.toggle) {
				if (api.visible) {
					api.active = false;
					api.visible = false;
				} else {
					api.active = true;
				}
			}
		}, false);
		container.querySelector(".close").addEventListener("click", function (event) {
			event.preventDefault();
			event.stopPropagation();
			if (api.close) {
				api.remove();
			}
		}, false);
		Object.keys(defaults).forEach(function (key) {
			if (descriptor.hasOwnProperty(key)) {
				api[key] = descriptor[key];
			} else {
				api[key] = defaults[key];
			}
		});
		fireEvent("open");

		docklets.push(api);
		return api;
	};
});
