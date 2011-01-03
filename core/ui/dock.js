define(
["libraries/mustache", "text!templates/dock.mustache"],
function (mustache, dockTemplate) {
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

	/*
		descriptor: {
			active: Boolean,
			close: Boolean,
			position: Number,
			toggle: Boolean,
			visible: Boolean,
			events: {
				open: fn(api),
				close: fn(api),
				show: fn(api),
				hide: fn(api),
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
			get visible () {return container.lastChild.classList.contains("hide")},
			set visible (state) {
				var classes = container.lastChild.classList;
				if (state && classes.contains("hide")) {
					classes.remove("hide");
					fireEvent("show");
				}
				if (!state && !classes.contains("hide")) {
					if (api.active) {
						api.active = false;
					}
					classes.add("hide");
					fireEvent("hide");
				}
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
					delete descriptor.events.active;
				} else {
					container.classList.remove("active");
				}
			},

			get close () {return !container.querySelector(".close").classList.contains("hide")},
			set close (state) {
				container.querySelector(".close").classList[state ? "add" : "remove"]("hide");
			},

			get toggle () {return container.querySelector(".close").classList.contains("toggle")},
			set toggle (state) {
				container.querySelector(".close").classList[state ? "add" : "remove"]("toggle");
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
				container.parentNode.removeNode(container);
				fireEvent("close");
			}
		};

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
		"active visible close toggle position title content".split(" ").forEach(function (key) {
			if (descriptor.hasOwnProperty(key)) {
				api[key] = descriptor[key];
			}
		});
		fireEvent("open");

		return api;
	};
});
