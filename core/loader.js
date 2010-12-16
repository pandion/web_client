define(["core/events"], function (events) {
	events.subscribe("xmpp.connected", function () {
		require(["core/loaderList"], function (loaderList) {
			require(loaderList, function (module) {
				events.publish("modules.ready");
			});
		});
	});

	return {};
});
