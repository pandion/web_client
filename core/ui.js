/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/paths"], function (paths) {
	var contentPanel = document.querySelector("#content");
	var activeContentCreator = null;

	return {
		addNavigation: function (navigation) { // {title: "", tooltip: "", path: "", state: {}, url: "", target: "", callback: function()}
			var anchor = document.createElement("a");
			if ("title" in navigation) {
				anchor.textContent = navigation.title;
			}
			if ("tooltip" in navigation) {
				anchor.title = navigation.tooltip;
			}
			if ("path" in navigation) {
				anchor.href = navigation.path;
				anchor.addEventListener("click", function (event) {
					event.preventDefault();
					history.pushState(navigation.state, navigation.title, navigation.path);
				}, false);
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
/*			var container = document.createElement("li");
			var header = container.appendChild(document.createElement("h1"));
			var content = container.appendChild(document.createElement("section"));
			try {
				gadgetCreator.open(header, content);
			} catch (error) {
				return;
			}
			document.querySelector("#gadgets menu").appendChild(container);
*/		},
		addContent: function (content) { // {open: function(panelElement), close: function(), path: regex}
			paths.subscribe(content.path, function () {
				if (activeContentCreator !== null && close in activeContentCreator) {
					try {
						activeContentCreator.close();
					} catch (error) {
					}
				}
				while (contentPanel.hasChildNodes()) {
					contentPanel.removeChild(contentPanel.firstChild);
				}
				if (open in handler) {
					try {
						content.open(contentPanel, state);
					} catch (error) {
					}
				}
			});
		}
	};
});
