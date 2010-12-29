define(function () {
	/*
		descriptor: {
			title: String|Element,
			content: String|Element
		}
	*/
	return function (descriptor) {
		var gadget = {};
		var container = document.createElement("li");
		var headerElement = container.appendChild(document.createElement("h1"));
		var contentElement = container.appendChild(document.createElement("section"));
		document.querySelector("#gadgets menu").appendChild(container);

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

		var api = {
			get title () {return headerElement},
			set title (title) {
				setValue(headerElement, (gadget.title = title) || "");
			},

			get content () {return contentElement},
			set content (content) {
				setValue(contentElement, content || "");
			}
		};

		"title content".split(" ").forEach(function (key) {
			if (descriptor.hasOwnProperty(key)) {
				api[key] = descriptor[key];
			}
		});

		return api;
	};
});
