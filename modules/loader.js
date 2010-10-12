/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
require.def(["modules/events"], function (events) {
	events.subscribe("app.ready", function () {
		require(["modules/loaderList"], function (loaderList) {
			var counter = 0;
			loaderList.forEach(function (moduleName) {
				require(["modules/" + moduleName], function (module) {
					counter++;
					if (counter === loaderList.length) {
						events.publish("modules.ready");
					}
				});
			});
		});
		events.unsubscribe("app.ready", this);
	});

	return {
		install: function () {
		},
		uninstall: function () {
		},
		load: function () {
		},
		unload: function () {
		},
	};
});
