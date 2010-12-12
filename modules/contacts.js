/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(
	["core/events", "core/xmpp", "core/xpath", "modules/rosterCache", "modules/jidParser"],
	function (events, xmpp, xpath, rosterCache, jidParser
) {
	var $xml = function (snippet) {
		return (new DOMParser).parseFromString(snippet, "text/xml").documentElement;
	};

	var xmlns = {
		stream: "http://etherx.jabber.org/streams",
		client: "jabber:client",
		roster: "jabber:iq:roster",
		rosterver: "urn:xmpp:features:rosterver"
	};

	var versioningSupported = false;

	var roster = {
		version: "",
		contacts: {
/*			"user@server": {
				subscription: "none|to|from|both",
				ask: "subscribe",
				name: "Some User",
				groups: [
					"somegroup", // ... more group names
				],
				resources: {
					"web_client_s1d51fsf231": {
						message: "away",
						status: "I'm not here right now",
						priority: 5,
						avatar: "1f56wq621ds564e5f4e5w1q65d4edbh"
					}, // ... more resources
				}
			}, // ... more contacts
*/		}
	};

	var onConnected = function () {
		versioningSupported = !!(xmpp.features && xpath(xmpp.features, "/stream:features/rosterver:ver", Object, xmlns));
		var iq = $xml("<iq type='get'><query xmlns='jabber:iq:roster'/></iq>");
		if (versioningSupported) {
			iq.firstChild.setAttribute("ver", rosterCache.version(xmpp.connection.jid.bare));
		}
		xmpp.sendIQ(iq, function (iq) {
			var oldContacts = roster.contacts;
			if (versioningSupported && !xpath(iq, "/client:iq/roster:query", Object, xmlns)) {
				roster = rosterCache.load(xmpp.connection.jid.bare);
			} else {
				roster = parseRosterIQ(iq).roster;
				rosterCache.save(xmpp.connection.jid.bare, roster);
			}
			var changedContacts = compareContacts(oldContacts, roster.contacts);
			if (Object.keys(changedContacts).length > 0) {
				events.publish("contacts.change", changedContacts);
			}
			xmpp.subscribe(rosterIQHandler);
			xmpp.subscribe(presenceHandler);
			events.publish("contacts.ready");
		});
		events.subscribe("xmpp.disconnected", onDisconnected);
	};

	var onDisconnected = function () {
		var spoofedUnavailable = {type: "unavailable"};
		Object.keys(roster.contacts).forEach(function (jid) {
			var contact = roster.contacts[jid];
			Object.keys(contact.resources).forEach(function (resource) {
				delete contact.resources[resource];
				events.publish("contacts.unavailable", jid, resource, spoofedUnavailable);
			});
		});
		xmpp.unsubscribe(rosterIQHandler);
		xmpp.unsubscribe(presenceHandler);
		events.subscribe("xmpp.connected", onConnected);
	};

	var isIdenticalRosterItem = function (item1, item2) {
		return (
			["name", "ask", "subscription"].reduce(function (identical, property) {
				return identical && (item1[property] === item2[property]);
			}, item1.groups.reduce(function (identical, group) {
				return identical && (item2.groups.indexOf(group) !== -1)
			}, (item1.groups.length === item2.groups.length)))
		);
	};

	var compareContacts = function (oldContacts, newContacts) {
		var changedContacts = {};
		// New or changed contact
		Object.keys(newContacts).forEach(function (jid) {
			if (!Object.hasOwnProperty.call(oldContacts, jid) ||
				!isIdenticalRosterItem(newContacts[jid], oldContacts[jid])
			) {
				changedContacts[jid] = newContacts[jid];
			}
		});
		// Removed contact
		Object.keys(oldContacts).forEach(function (jid) {
			if (!Object.hasOwnProperty.call(newContacts, jid)) {
				changedContacts[jid] = {subscription: "remove"};
			}
		});
		return changedContacts;
	};

	var presenceHandler = {
		xpath: "/client:presence[@from]", xmlns: xmlns,
		callback: function (presence) {
			var jid = jidParser(presence.getAttribute("from"));
			if (jid && Object.hasOwnProperty.call(roster.contacts, jid.bare)) {
				var contact = roster.contacts[jid.bare];
				var resource = Object.hasOwnProperty.call(contact.resources, jid.resource) ?
								contact.resources[jid.resource] :
								(contact.resources[jid.resource] = {});
				var type = presence.hasAttribute("type") ? presence.getAttribute("type") : "";
				switch (type) {
					case "": // Available is indicated by lack of "type" attribute
						["show", "status", "priority"].forEach(function (tagName) {
							var tag = xpath(presence, "/client:presence/client:" + tagName, Object, xmlns);
							resource[tagName] = tag ? tag.textContent : "";
						});
						resource.priority = parseInt(resource.priority, 10);
						if (isNaN(resource.priority) ||
							resource.priority < -128 ||
							resource.priority > 127
						) {
							resource.priority = 0;
						}
						events.publish("contacts.available", presence, jid.bare, jid.resource, resource);
						break;
					case "unavailable":
						delete contact.resources[jid.resource];
						var status = xpath(presence, "/client:presence/status", Object, xmlns);
						events.publish("contacts.unavailable", presence, jid.bare, jid.resource, {
							type: "unavailable",
							status: status ? status.textContent : ""
						});
						break;
					case "subscribe":
					case "subscribed":
					case "unsubscribe":
					case "unsubscribed":
						events.publish("contacts." + type, presence, jid.bare, jid.resource);
						break;
				}
			}
			return true;
		}
	};

	var rosterIQHandler = {
		xpath: "/client:iq[@type='set']/roster:query", xmlns: xmlns,
		callback: function (iq, query) {
			var changedContacts = parseRosterIQ(iq, roster).changedContacts;
			if (Object.keys(changedContacts).length > 0) {
				rosterCache.save(xmpp.connection.jid.bare, roster);
				events.publish("contacts.change", changedContacts);
			}
			return true;
		}
	};

	var parseRosterIQ = function (iq, roster) {
		var changedContacts = {};
		roster = roster || {
			version: "",
			contacts: {}
		};
		xpath(iq, "/client:iq/roster:query/roster:item", Array, xmlns).forEach(function (item) {
			var jid = item.getAttribute("jid")
			if (jid) {
				var contact = {};
				["name", "ask", "subscription"].forEach(function (property) {
					contact[property] = item.getAttribute(property) || "";
				});
				contact.groups = [];
				contact.resources = Object.hasOwnProperty.call(roster.contacts, jid) ?
									roster.contacts[jid].resources : {};
				xpath(item, "roster:group", Array, xmlns).forEach(function (group) {
					if (contact.groups.indexOf(group.textContent) === -1) {
						contact.groups.push(group.textContent);
					}
				});
				if (!Object.hasOwnProperty.call(roster.contacts, jid) ||
					!isIdenticalRosterItem(contact, roster.contacts[jid])
				) {
					changedContacts[jid] = contact;
				}
				if (contact.subscription === "remove") {
					delete roster.contacts[jid];
				} else {
					roster.contacts[jid] = contact;
				}
			}
		});

		var query = xpath(iq, "/client:iq/roster:query", Object, xmlns);
		roster.version = query.hasAttribute("ver") ? query.getAttribute("ver") : "";

		return {roster: roster, changedContacts: changedContacts};
	};

	if (xmpp.connection.status === "connected") {
		onConnected();
	} else {
		events.subscribe("xmpp.connected", onConnected);
	}

	return roster.contacts;
});
