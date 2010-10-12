/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
require.def(["core/events"], function (events) {
	var localStorageKey = "webclientSettings";
	var settings = {};
	try {
		JSON.parse(localStorage[localStorageKey]);
	} catch (error) {
	}

	var onStorage = function (event) {
		if (event.key === localStorageKey) {
			try {
				settings = JSON.parse(event.newValue);
			} catch (error) {
				return;
			}
			events.publish("settings.change");
		}
	};
	window.addEventListener("storage", onStorage, false);

	var saveToStorage = function (event) {
		window.removeEventListener("storage", onStorage, false);
		localStorage[localStorageKey] = JSON.stringify(settings);
		window.addEventListener("storage", onStorage, false);
	};
	window.addEventListener("unload", saveToStorage, false);
	events.subscribe("settings.save", saveToStorage);

	return settings;
});
