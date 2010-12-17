define(
["core/paths", "core/events", "core/ui", "core/css", "libraries/mustache", "text!templates/search.mustache"],
function (paths, events, ui, css, mustache, searchTemplate) {
	css.load("modules/search");
	document.querySelector("#menubar").insertAdjacentHTML("afterEnd", mustache.to_html(searchTemplate));
	document.querySelector("#search").addEventListener("submit", function (event) {
		event.preventDefault();
		paths.publish("search/" + this.querySelector("input[type='search']").value);
	}, false);

	var resultsTimeout = null;
	var resultsElement = null;
	var resultsListener = function (payload) {
		clearPending();
		require(["text!templates/searchResults.mustache"], function (searchResultsTemplate) {
			var html = mustache.to_html(searchResultsTemplate, payload);
			if (resultsElement) {
				resultsElement.insertAdjacentHTML("beforeEnd", html);
			}
		});
		return true; // keep listening for more results
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
			css.load("modules/searchPage");
			require(["text!templates/searchPage.mustache"], function (searchPageTemplate) {
				var queryString = path.substring(7);
				element.insertAdjacentHTML("afterBegin", mustache.to_html(searchPageTemplate, {query: queryString}));
				resultsElement = element.querySelector("#search-results-list");
				events.subscribe("search.results", resultsListener);
				resultsTimeout = setTimeout(clearPending, 2000);
				events.publish("search.query", queryString);
			});
		},
		close: function () {
			css.unload("modules/searchPage");
			resultsElement = null;
			events.unsubscribe("search.results", resultsListener);
			clearTimeout(resultsTimeout);
		}
	});
	return {};
});
