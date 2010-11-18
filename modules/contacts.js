/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events", "core/xmpp"], function (events, xmpp) {
	events.subscribe("xmpp.connecting", function () {
		xmpp.subscribe({
			xpath: "/stream:features/rosterver:ver",
			xmlns: {rosterver: "urn:xmpp:features:rosterver"},
			type: Object,
			callback: function (stanza, ver) {
				console.log("got optional?", !!ver.querySelector("optional"));
				return true;
			}
		});
	});
	return {};
});
