/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(function () {
	var pathHandlers = [];

	var runMatching = function (handler, state) {
		if (handler.path.test(location.pathname)) {
			handler.callback();
		}
	};

	window.addEventListener("popstate", function (event) {
		pathHandlers.forEach(function (handler) {
			runMatching(handler, event.state);
		});
	}, false);

	return {
		subscribe: function (path, callback) {
			var handler = {
				path: path,
				callback: callback
			};
			pathHandlers.push(handler);
			runMatching(handler, {});
		}
	};
});
