/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events", "core/xmpp"], function (events, xmpp) {
	var roster = {
		rosterver: {
			supported: false,
			version: null
		},
		groups: {
		}
	};

	events.subscribe("xmpp.connecting", function () {
		xmpp.subscribe({
			xpath: "/stream:features/rosterver:ver",
			xmlns: {rosterver: "urn:xmpp:features:rosterver"},
			type: Object,
			callback: function (stanza, ver) {
				roster.rosterver.supported = !!ver.querySelector("optional");
				console.log("rosterver supported?", roster.rosterver.supported);
				return true;
			}
		});
	});

	return {};
});
