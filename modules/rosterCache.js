define(function () {
	var rosterCache = null;
	/*{
		"user@server": {
			contacts: {
				"someone@example.com": {
					"name": "Some One",
					"ask": "subscribe",
					"subscription": "none",
					"groups": ["Friends", "Hobby"],
					"resources": {
						"homelaptop": {
							// ...
						}, // ... more resources
					}
				}, // ... more contacts
			},
			version: "abc123"
		}, // ... more users
	}*/

	var loadFromStorage = function () {
		try {
			rosterCache = JSON.parse(localStorage["RosterCache"]) || {};
		} catch (error) {
			rosterCache = {};
		}
	};

	window.addEventListener("storage", function (event) {
		if (event.key === "RosterCache") {
			loadFromStorage();
		}
	}, false);

	return {
		save: function (jid, roster) {
			if (!rosterCache) {
				loadFromStorage();
			}
			var cloneCache = {
				version: roster.version,
				contacts: {}
			};
			Object.keys(roster.contacts).forEach(function (contactJid) {
				cloneCache.contacts[contactJid] = {resources: {}};
				["name", "ask", "subscription", "groups"].forEach(function (property) {
					cloneCache.contacts[contactJid][property] = roster.contacts[contactJid][property];
				});
			});
			rosterCache[jid] = cloneCache;
			try {
				localStorage["RosterCache"] = JSON.stringify(rosterCache);
			} catch (error) {
				console.warn("[RosterCache] Failed to persist roster cache");
			}
		},

		load: function (jid) {
			if (!rosterCache) {
				loadFromStorage();
			}
			return Object.hasOwnProperty.call(rosterCache, jid) ? rosterCache[jid] : {version: "", contacts: {}};
		},

		version: function (jid) {
			if (!rosterCache) {
				loadFromStorage();
			}
			return Object.hasOwnProperty.call(rosterCache, jid) ? rosterCache[jid].version : "";
		}
	};
});
