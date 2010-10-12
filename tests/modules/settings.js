/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
require.def(["modules/settings", "modules/events"], function (settings, events) {
	module("settings", {
		setup: function () {
		},
		teardown: function () {
		}
	});

	test("Creating and reading values", 3, function () {
		var testValue = {
			foo: "bar",
			baz: 123,
			abc: ["x", "y", "z"]
		};

		settings.myTest = testValue;
		equal(settings.myTest.abc[0], "x", "Assigning a setting and reading it back");

		events.publish("settings.save");
		same(
			JSON.parse(localStorage["webclientSettings"]).myTest,
			testValue,
			"Saving settings to local storage"
		);

		delete settings.myTest;
		equal(settings.myTest, undefined, "Removing a setting");
	});

	return {};
});
