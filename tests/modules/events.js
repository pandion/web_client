/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
require.def(["modules/events"], function (events) {
	module("events", {
		setup: function () {
			var that = this;
			this.counter = 0;
			this.increment = function () {
				that.counter++;
			};
		},
		teardown: function () {
		}
	});

	test("Simple attaching, firing, listening, unsubscribing", 3, function () {
		events.subscribe("foo.bar", this.increment);
		events.subscribe("foo.bar", this.increment);
		events.publish("foo.bar");
		ok(this.counter > 0, "Callback was executed");
		equals(this.counter, 1, "Prevent multiple identical callback");

		events.unsubscribe("foo.bar", this.increment);
		var lastCounter = this.counter;
		events.publish("foo.bar");
		equals(this.counter, lastCounter, "No longer called after unsubscribing");
	});

	test("Unsubscribe during publish", 1, function () {
		var that = this;
		events.subscribe("foo", function () {
			that.increment();
			events.unsubscribe("foo", this);
		});
		events.publish("foo");
		events.publish("foo");
		equals(this.counter, 1, "Fired just once");
	});

	test("Payload passing", 1, function () {
		var checkArguments = function (foo, bar, baz) {
			same([foo, bar, baz], [1, 2, 3], "Callback received correct payload values");
		};
		events.subscribe("foo", checkArguments);
		events.publish("foo", 1, 2, 3);
		events.unsubscribe("foo", checkArguments);
	});

	return {};
});
