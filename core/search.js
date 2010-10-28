/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/paths", "core/events", "core/ui", "libraries/mustache", "text!templates/search.mustache"], function (paths, events, ui, mustache, searchTemplate) {
	document.querySelector("#menubar").insertAdjacentHTML("afterEnd", mustache.to_html(searchTemplate));
	document.querySelector("#search").addEventListener("submit", function (event) {
		event.preventDefault();
		paths.publish("search/" + this.querySelector("input[type='search']").value);
	}, false);
	ui.addContent({
		path: /^search/,
		open: function (path, element) {
			console.log("open search");
			var queryString = path.substring(7);
			element.insertAdjacentHTML("beforeEnd", "<h1>Searching for \"" + queryString + "\"</h1>");
			events.publish("search.query", queryString);
		},
		close: function () {
			console.log("close search");
		}
	});
	// TODO: provide a callback or API for the search results and display them.
	// Callback could be in the search module (return value below) or in the event payload.
	return {};
});
