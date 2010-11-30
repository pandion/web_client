/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events", "core/xmpp"], function (events, xmpp) {
	var $xml = function (snippet) {
		return (new DOMParser).parseFromString(snippet, "text/xml").documentElement;
	};

	var roster = {
		versioning: {
			supported: false,
			version: ""
		},
		groups: [/*
			"somegroup": {
				visible: true,
				contacts: [
					{
						address: "user@server",
						subscription: "none|to|from|both",
						ask: "subscribe",
						name: "Some User",
						resources: [
							{
								id: "web_client_s1d51fsf231",
								message: "away",
								status: "I'm not here right now",
								priority: 5,
								avatar: "1f56wq621ds564e5f4e5w1q65d4edbh"
							},
							// ... more resources
						]
					},
					// ... more contacts
				]
			},
			// ... more groups
		*/]
	};

	var onConnected = function () {
		roster.versioning.supported = !!(xmpp.features && (
			xmpp.features.querySelector("features > ver > optional") ||
			xmpp.features.querySelector("features > ver > required")
		));
		var iq = $xml("<iq type='get'><query xmlns='jabber:iq:roster'/></iq>");
		if (roster.versioning.supported) {
			iq.firstChild.setAttribute("ver", roster.versioning.version);
		}
		xmpp.sendIQ(iq, function (iq) {
			console.log("got roster!", iq);
		});
		events.subscribe("xmpp.disconnected", onDisconnected);
		return true;
	};

	var onDisconnected = function () {
		roster.groups.forEach(function (group) {
			group.contacts.forEach(function (contact) {
				contact.resources.forEach(function (resource) {
					events.publish("contacts.statusChange." + contact.address + "/" + resource.id, {
						status: "unavailable"
					});
				});
			});
		});
	};

	if (xmpp.connection.status === "connected") {
		onConnected();
	}
	events.subscribe("xmpp.connected", onConnected);

	return roster;
});
