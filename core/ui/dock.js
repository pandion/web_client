define(
["libraries/mustache", "text!templates/dock.mustache"],
function (mustache, dockTemplate) {
	var fireEvent = function (dock, type) {
		if (dock.events && (typeof dock.events[type] === "function")) {
			dock.events[type]();
		}
	};

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
				open: fn(docklet),
				close: fn(docklet),
				show: fn(docklet),
				hide: fn(docklet)
			}
		}
	*/
	return function (descriptor) {
		var dock = descriptor || {};

		var api = {
			get visible () {return container.lastChild.classList.contains("hide")},
			set visible (state) {
				var classes = container.lastChild.classList;
				if (state && classes.contains("hide")) {
					classes.remove("hide");
					fireEvent(dock, "show");
				}
				if (!state && !classes.contains("hide")) {
					if (api.active) {
						api.active = false;
					}
					classes.add("hide");
					fireEvent(dock, "hide");
				}
			},

			get active () {return container.classList.contains("active")},
			set active (state) {
				if (state && !api.visible) {
					api.visible = true;
				}
				container.classList[state ? "add" : "remove"]("active");
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

			remove: function () {
				container.parentNode.removeNode(container);
				fireEvent(dock, "close");
			}
		};

		var offscreen = document.createElement("p");
		offscreen.insertAdjacentHTML("beforeEnd", mustache.to_html(dockTemplate));
		var container = offscreen.firstChild;
		document.querySelector("#dock menu").insertAdjacentElement("beforeEnd", container);
		container.querySelector(".tab").addEventListener("click", function (event) {
			if (api.toggle) {
				api.visible = !api.visible;
			}
		}, false);
		container.querySelector(".close").addEventListener("click", function (event) {
			event.preventDefault();
			event.stopPropagation();
			api.remove();
		}, false);
		"active visible close toggle position title content".split(" ").forEach(function (key) {
			if (descriptor.hasOwnProperty(key)) {
				api[key] = descriptor[key];
			}
		});
		fireEvent(dock, "open");

		return api;
	};
});
