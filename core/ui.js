define(
["core/paths", "core/css", "libraries/mustache", "text!templates/ui.mustache"],
function (paths, css, mustache, uiTemplate) {
	var ui = {
		addNavigation: function (navigation) { // {title: "", tooltip: "", path: "", url: "", target: "", callback: function()}
			var anchor = document.createElement("a");
			if ("title" in navigation) {
				anchor.textContent = navigation.title;
			}
			if ("tooltip" in navigation) {
				anchor.title = navigation.tooltip;
			}
			if ("path" in navigation) {
				anchor.href = navigation.path;
			} else if ("url" in navigation) {
				anchor.href = navigation.url;
				anchor.target = "target" in navigation ? navigation.target : "_blank";
			} else {
				anchor.href = "#";
			}
			if ("callback" in navigation) {
				anchor.addEventListener("click", function (event) {
					event.preventDefault();
					navigation.callback();
				}, false);
			}
			var menuItem = document.createElement("li");
			menuItem.appendChild(anchor);
			document.querySelector("#menubar menu").appendChild(menuItem);
		},
		addGadget: function (gadgetCreator) { // {open: function(headerElement, contentElement)}
			var container = document.createElement("li");
			var header = container.appendChild(document.createElement("h1"));
			var content = container.appendChild(document.createElement("section"));
			if (gadgetCreator !== null && "open" in gadgetCreator)
			try {
				gadgetCreator.open(header, content);
			} catch (error) {}
			document.querySelector("#gadgets menu").appendChild(container);
		},
		addContent: function (content) { // {open: function(panelElement), close: function(), path: regex}
			paths.subscribe(content.path, function (path) {
				if (activeContentCreator !== null && "close" in activeContentCreator) {
					try {
						activeContentCreator.close();
					} catch (error) {}
				}
				while (contentPanel.hasChildNodes()) {
					contentPanel.removeChild(contentPanel.firstChild);
				}
				activeContentCreator = content;
				if ("open" in content) {
					try {
						content.open(path, contentPanel);
					} catch (error) {}
				}
			});
		}
	};

	css.load("core/ui");
	document.body.insertAdjacentHTML("beforeEnd", mustache.to_html(uiTemplate));
	var contentPanel = document.querySelector("#content");
	var activeContentCreator = null;

	document.body.addEventListener("click", function (event) {
		if (event.target.tagName === "A") {
			var href = event.target.getAttribute("href").trim();
			if (href !== "#" && !/^(http|https)+:\/\//.test(href)) {
				event.preventDefault();
				paths.publish(href);
			}
		}
	}, false);

	return ui;
});
