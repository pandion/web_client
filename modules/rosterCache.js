/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(function () {
	var rosterCache = null;
	/*{
		"user@server": {
			contacts: {
				// ...
			},
			version: "abc123"
		},
		// ...
	}*/

	var loadFromStorage = function () {
		try {
			rosterCache = JSON.parse(localStorage["RosterCache"]);
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
				cloneCache.contacts[contactJid] = {};
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
			return rosterCache.hasOwnProperty(jid) ? rosterCache[jid] : {version: "", contacts: {}};
		},

		version: function (jid) {
			if (!rosterCache) {
				loadFromStorage();
			}
			return rosterCache.hasOwnProperty(jid) ? rosterCache[jid].version : "";
		}
	};
});
