define(function () {
	/*
		descriptor: {
			title: "",
			tooltip: "",
			path: "",
			url: "",
			target: "",
			callback: fn()
		}
	*/
	return function (descriptor) {
		var navigation = {};
		var container = document.createElement("li");
		var anchor = document.createElement("a");
		var clickHandler = function (event) {
			event.preventDefault();
			navigation.callback();
		};

		var api = {
			get title () {return navigation.title},
			set title (title) {
				anchor.textContent = (navigation.title = title) || "";
			},

			get tooltip () {return navigation.tooltip},
			set tooltip (tooltip) {
				anchor.title = (navigation.tooltip = tooltip) || "";
			},

			get path () {return navigation.path},
			set path (path) {
				delete navigation.url;
				delete navigation.target;
				anchor.target = null;
				anchor.href = (navigation.path = path) || "";
			},

			get url () {return navigation.url},
			set url (url) {
				delete navigation.path;
				anchor.target = navigation.target = ((typeof navigation.target === "string") ? navigation.target : "_blank");
				anchor.href = (navigation.url = url) || "";
			},

			get target () {return navigation.target},
			set target (target) {
				anchor.target = (navigation.target = target) || "";
			},

			get callback () {return navigation.callback},
			set callback (callback) {
				navigation.callback = callback;
				if (!(navigation.url || navigation.path)) {
					anchor.href = "#";
				}
				if (callback) {
					anchor.addEventListener("click", clickHandler, false);
				} else {
					anchor.removeEventListener("click", clickHandler, false);
				}
			}
		};

		"title tooltip callback target url path".split(" ").forEach(function (key) {
			if (descriptor.hasOwnProperty(key)) {
				api[key] = descriptor[key];
			}
		});

		container.appendChild(anchor);
		document.querySelector("#menubar menu").appendChild(container);

		return api;
	};
});
