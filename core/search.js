/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(
	[
		"core/paths",
		"core/events",
		"core/ui",
		"libraries/mustache",
		"text!templates/search.mustache",
		"text!templates/searchPage.mustache",
		"text!templates/searchResults.mustache"
	],
	function (paths, events, ui, mustache, searchTemplate, searchPageTemplate, searchResultsTemplate) {
		document.querySelector("#menubar").insertAdjacentHTML("afterEnd", mustache.to_html(searchTemplate));
		document.querySelector("#search").addEventListener("submit", function (event) {
			event.preventDefault();
			paths.publish("search/" + this.querySelector("input[type='search']").value);
		}, false);

		var resultsTimeout = null;
		var resultsElement = null;
		var resultsListener = function (payload) {
			clearPending();
			if (resultsElement !== null) {
				var html = mustache.to_html(searchResultsTemplate, payload);
				resultsElement.insertAdjacentHTML("beforeEnd", html);
			}
		};
		var clearPending = function () {
			var pendingElement = document.querySelector("#search-results-waiting");
			if (pendingElement) {
				pendingElement.parentNode.removeChild(pendingElement);
			}
		};
		ui.addContent({
			path: /^search/,
			open: function (path, element) {
				var queryString = path.substring(7);
				element.insertAdjacentHTML("afterBegin", mustache.to_html(searchPageTemplate, {query: queryString}));
				resultsElement = element.querySelector("#search-results-list");
				events.subscribe("search.results", resultsListener);
				resultsTimeout = setTimeout(clearPending, 2000);
				events.publish("search.query", queryString);
			},
			close: function () {
				resultsElement = null;
				events.unsubscribe("search.results", resultsListener);
				clearTimeout(resultsTimeout);
			}
		});
		return {};
	}
);
