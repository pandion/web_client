/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events", "libraries/mustache", "text!templates/search.mustache"], function (events, mustache, searchTemplate) {
	document.querySelector("#menubar").insertAdjacentHTML("afterEnd", mustache.to_html(searchTemplate));
	document.querySelector("#search").addEventListener("submit", function (event) {
		event.preventDefault();
		events.publish("search.query", this.querySelector("input[type='search']").value);
	}, false);
	// TODO: provide a callback or API for the search results and display them.
	// Callback could be in the search module (return value below) or in the event payload.
	return {};
});
