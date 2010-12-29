define(["core/paths"], function (paths) {
	var activeContent = null;
	var close = function (content) {
		var panel = document.querySelector("#content");
		if (content === activeContent) {
			if ("close" in content) {
				content.close(content.path, panel);
			}
			while (panel.hasChildNodes()) {
				panel.removeChild(panel.firstChild);
			}
		}
	};
	var open = function (content) {
		var panel = document.querySelector("#content");
		if (activeContent) {
			close(activeContent);
			activeContent = null;
		}
		if (content) {
			activeContent = content;
			if ("open" in content) {
				content.open(content.path, panel);
			}
		}
	};

	/*
		descriptor: {
			path: RegEx,
			open: Function,
			close: Function
		}
	*/
	return function (descriptor) {
		if ("path" in descriptor) {
			paths.subscribe(descriptor.path, function () {
				open(descriptor);
			});
		}

		var api = {
			open: function () {
				open(descriptor);
			},
			close: function () {
				close(descriptor);
			}
		};

		return api;
	};
});
