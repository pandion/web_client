/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(function () {
	var pathHandlers = [];

	var method = "fragment"; // "fragment" or "history"
	var pathEngines = {
		fragment: {
			init: function () {
				window.addEventListener("hashchange", function (event) {
					pathHandlers.forEach(function (handler) {
						pathEngines[method].runIfMatch(handler, event.state);
					});
				}, false);
			},
			runIfMatch: function (handler, state) {
				var path = location.hash.substring(1);
				if (handler.path.test(path)) {
					handler.callback(path);
				}
			},
			publish: function (path) {
				location.hash = path;
			}
		},
		history: {
			init: function () {
				window.addEventListener("popstate", function (event) {
					pathHandlers.forEach(function (handler) {
						pathEngines[method].runIfMatch(handler, event.state);
					});
				}, false);
			},
			runIfMatch: function (handler, state) {
				var path = location.pathname.substring(1);
				if (handler.path.test(path)) {
					handler.callback(path);
				}
			},
			publish: function (path) {
				history.pushState({}, "", "/" + path);
				var event = document.createEvent("HTMLEvents");
				event.initEvent("popstate", true, true);
				window.dispatchEvent(event);
			}
		}
	};

	pathEngines[method].init();

	return {
		subscribe: function (path, callback) {
			var handler = {
				path: path,
				callback: callback
			};
			pathHandlers.push(handler);
			pathEngines[method].runIfMatch(handler, {});
		},
		publish: pathEngines[method].publish
	};
});
