/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events"], function (events) {
	events.subscribe("search.query", function (queryString) {
		// http://search.twitter.com/search.json?q=123&callback=?
		// http://search.twitter.com/trends/current.json?callback=?
		require(["jsonp!http://search.twitter.com/search.json?q=" + encodeURIComponent(queryString) + "&callback=?"],
			function (payload) {
				events.publish("search.results", payload);
			}
		);
	});
	return {};
});
