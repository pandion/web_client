/**	Package: roster
 *	Parsing and eventing for the XMPP roster data.
 *
 *	Returns:
 *		<RosterContacts>
 *
 *	Event: roster.change
 *		One or more roster items have been updated.
 *
 *		Payload:
 *		(RosterContacts) changedContacts - Contains <RosterContacts> that have been modified.
 *
 *	Event: roster.ready
 *		The roster has been loaded.
 *
 *  Event: roster.unavailable
 *		A contact goes offline or becomes otherwise unavailable. All its resources are disconnected.
 *
 *		Payload:
 *		(Element) presence - The <presence/> stanza.
 *		(String) jid - The bare address of the contact.
 *		(String) resource - The resource of the contact.
 *		(Object) status - Contains the type and the resource's last message.
 *
 *	Event: roster.available
 *		A contact's resource comes online or changes their availability.
 *
 *		Payload:
 *		(Element) presence - The <presence/> stanza.
 *		(String) jid - The bare address of the contact.
 *		(String) resource - The resource of the contact.
 *		(RosterResource) rosterResource - The parsed <RosterResource> object.
 *
 *	Event: roster.subscribe
 *
 *		Payload:
 *		(Element) presence - The <presence/> stanza.
 *		(String) jid - The bare address of the contact.
 *		(String) resource - The resource of the contact.
 *
 *	Event: roster.subscribed
 *		See: <roster.subscribe>
 *
 *	Event: roster.unsubscribe
 *		See: <roster.subscribe>
 *
 *	Event: roster.unsubscribed
 *		See: <roster.subscribe>
 */
define(
["core/events", "core/xmpp", "core/xpath", "modules/rosterCache", "modules/jidParser"],
function (events, xmpp, xpath, rosterCache, jidParser) {
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
		/** Interface: RosterContacts
		 *  Map containing all roster items as <RosterItems>.
		 *
		 *  Example:
		 *	(code)
		 *	"user@server": {
		 *		subscription: "none|to|from|both",
		 *		ask: "subscribe",
		 *		name: "Some User",
		 *		groups: [
		 *			"somegroup", // ... more group names
		 *		],
		 *		resources: {
		 *			"web_client_s1d51fsf231": {
		 *				show: "away",
		 *				status: "I'm not here right now",
		 *				priority: 5
		 *			}, // ... more resources
		 *		}
		 *	}, // ... more contacts
		 *	(end)
		 */
		/** Interface: RosterItem
		 *  Contains the information of a single contact.
		 *
		 *  Properties:
		 *  (String) subscription - Subscription state of the contact. Values: *both*, *from*, *none*, *remove*, *to*
		 *  (String) ask - Whether the contact is pending approval. Values: *subscribe* or an empty string
		 *  (String) name - Name of the contact in the roster.
		 *  (Array) groups - Names of groups which the contact is part of.
		 *  (Object) resources - All the available <RosterResources> of the contact. Accessed by resource.
		 */
		/** Interface: RosterResource
		 *  Stores information about the available resource.
		 *
		 *  Properties:
		 *  (String) status - A simple text message of the resource.
		 *  (String) show - The type of availability of the resource. Values: *ffc* (Free For Chat), *dnd* (Do Not Disturb or Busy), *away*, *xaway* (Extended Away or Idle) or empty string (Available).
		 *  (Number) priority - An integer between -127 and 128 incidicating the importance of the contact for message routing.
		 */
		contacts: {}
	};

	var onConnected = function () {
		versioningSupported = !!(xmpp.features && xpath(xmpp.features, "/stream:features/rosterver:ver", Object, xmlns));
		var iq = $xml("<iq type='get'><query xmlns='jabber:iq:roster'/></iq>");
		if (versioningSupported) {
			iq.firstChild.setAttribute("ver", rosterCache.version(xmpp.connection.jid.bare));
		}
		xmpp.sendIQ(iq, function (iq) {
			var oldContacts = roster.contacts;
			var newRoster;
			if (versioningSupported && !xpath(iq, "/client:iq/roster:query", Object, xmlns)) {
				newRoster = rosterCache.load(xmpp.connection.jid.bare);
			} else {
				newRoster = parseRosterIQ(iq).roster;
				rosterCache.save(xmpp.connection.jid.bare, newRoster);
			}
			var changedContacts = compareContacts(oldContacts, newRoster.contacts);
			mergeRoster(roster, newRoster);
			if (Object.keys(changedContacts).length > 0) {
				events.publish("roster.change", changedContacts);
			}
			xmpp.subscribe(rosterIQHandler);
			xmpp.subscribe(presenceHandler);
			events.publish("roster.ready");
		});
		events.subscribe("xmpp.disconnected", onDisconnected);
	};

	var onDisconnected = function () {
		Object.keys(roster.contacts).forEach(function (jid) {
			var contact = roster.contacts[jid];
			Object.keys(contact.resources).forEach(function (resource) {
				delete contact.resources[resource];
				events.publish("roster.unavailable", null, jid, resource, "");
			});
		});
		xmpp.unsubscribe(rosterIQHandler);
		xmpp.unsubscribe(presenceHandler);
		events.subscribe("xmpp.connected", onConnected);
	};

	var mergeRoster = function (oldRoster, newRoster) {
		oldRoster.version = newRoster.version;
		Object.keys(oldRoster.contacts).forEach(function (jid) {
			delete oldRoster.contacts[jid];
		});
		Object.keys(newRoster.contacts).forEach(function (jid) {
			oldRoster.contacts[jid] = newRoster.contacts[jid];
		});
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
						events.publish("roster.available", presence, jid.bare, jid.resource, resource);
						break;
					case "unavailable":
						delete contact.resources[jid.resource];
						var status = xpath(presence, "/client:presence/status", Object, xmlns);
						events.publish("roster.unavailable", presence, jid.bare, jid.resource, status ? status.textContent : "");
						break;
					case "subscribe":
					case "subscribed":
					case "unsubscribe":
					case "unsubscribed":
						events.publish("roster." + type, presence, jid.bare, jid.resource);
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
				events.publish("roster.change", changedContacts);
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
