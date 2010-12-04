/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events", "core/xmpp", "core/xpath"], function (events, xmpp, xpath) {
	var $xml = function (snippet) {
		return (new DOMParser).parseFromString(snippet, "text/xml").documentElement;
	};

	var xmlns = {
		client: "jabber:client",
		roster: "jabber:iq:roster"
	};

	var roster = {
		versioning: {
			supported: false,
			version: ""
		},
/*		groups: [
			"somegroup": {
				visible: true
			},
			// ... more groups
		],
*/		contacts: {
/*			"user@server": {
				subscription: "none|to|from|both",
				ask: "subscribe",
				name: "Some User",
				groups: [
					"somegroup",
					// ... more group names
				],
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
*/		}
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
			var query = xpath(iq, "/client:iq/roster:query", Object, xmlns);
			if (query) {
				// TODO: load contacts from cache
			} else {
				parseFromRosterIQ(iq);
				var ver = query.getAttribute("ver");
				roster.versioning.supported = query.hasAttribute("ver") && ver !== "";
				roster.versioning.version = roster.versioning.supported ? ver : "";
				// Save roster to cache???
			}
			events.publish("contacts.ready");
			xmpp.subscribe(rosterIQHandler);
			xmpp.subscribe(presenceHandler);
		});
		events.subscribe("xmpp.disconnected", onDisconnected);
		return true;
	};

	var onDisconnected = function () {
		Object.keys(roster.contacts).forEach(function (jid) {
			var contact = roster.contacts[jid];
			var resource;
			while (resource = contact.resources.pop()) {
				events.publish("contacts.presence." + contact.address, {
					resource: resource.id,
					status: "unavailable"
				});
			}
		});
		xmpp.unsubscribe(rosterIQHandler);
		xmpp.unsubscribe(presenceHandler);
		events.subscribe("xmpp.connected", onConnected);
	};

	var presenceHandler = {
		xpath: "/client:presence",
		callback: function (presence) {
		}
	};

	var rosterIQHandler = {
		xpath: "/client:iq/roster:query",
		xmlns: xmlns,
		callback: function (iq, query) {
			parseFromRosterIQ(iq);
			// Save roster to cache???
		}
	};

	var parseFromRosterIQ = function (iq) {
		if (iq.getAttribute("type") === "set" || iq.getAttribute("type") === "result") {
			xpath(iq, "/client:iq/roster:query/item", Array, xmlns).forEach(function (item) {
				var jid = item.getAttribute("jid") || return;
				var contact = roster.contacts.hasOwnProperty(jid) ? roster.contacts[jid] : (roster.contacts[jid] = {});
				["name", "ask", "subscription"].forEach(function (property) {
					contact[property] = item.getAttribute(property) || "";
				});
				contact.groups = [];
				xpath(item, "/group", Array).forEach(function (group) {
					contact.groups.push(group.text);
				});
				events.publish("contacts.change." + jid, jid, roster[jid]);
				if (contact.subscription === "remove") {
					delete roster.contacts[jid];
				}
			});
		}
	};

	if (xmpp.connection.status === "connected") {
		onConnected();
	}
	events.subscribe("xmpp.connected", onConnected);

	return roster;
});
