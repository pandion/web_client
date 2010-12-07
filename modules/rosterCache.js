/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(function () {
	var rosterCache = null;
	var getRosterCache = function () {
		if (rosterCache) {
			return rosterCache;
		}
		try {
			rosterCache = JSON.parse(localStorage["RosterCache"]);
		} catch (error) {
			console.log("Failed to load roster cache");
		}
		return rosterCache || {};
	};

	return {
		save: function (roster) {
			var cloneCache = {
				version: roster.version,
				contacts: {}
			};
			Object.keys(roster.contacts).forEach(function (jid) {
				cloneCache.contacts[jid] = {};
				Object.keys(roster.contacts[jid]).forEach(function (property) {
					if (property !== "resources") {
						cloneCache.contacts[jid][property] = roster.contacts[jid][property];
					}
				});
			});
			try {
				localStorage["RosterCache"] = JSON.stringify(cloneCache);
			} catch (error) {
				console.log("Failed to persist roster cache");
			}
		},

		load: function (roster) {
			var cache = getRosterCache();
			roster.version = cache.version;
			if (cache.hasOwnProperty("contacts")) {
				roster.contacts = cache.contacts;
				Object.keys(roster.contacts).forEach(function (jid) {
					roster.contacts.resources = [];
				});
			}
		},

		get version () {
			var cache = getRosterCache();
			return cache.hasOwnProperty("version") ? cache.version : "";
		}
	};
});
