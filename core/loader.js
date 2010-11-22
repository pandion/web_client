/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events"], function (events) {
	events.subscribe("app.ready", function () {
		require(["core/loaderList"], function (loaderList) {
			require(loaderList, function (module) {
				events.publish("modules.ready");
			});
		});
	});

	return {};
});
