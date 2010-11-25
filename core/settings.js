/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events"], function (events) {
	var stubCopy = function (target, template) {
		Object.keys(template).forEach(function (key) {
			switch (typeof template[key]) {
				case "function":
					break;
				case "string":
				case "number":
				case "boolean":
					if (!target.hasOwnProperty(key)) {
						target[key] = template[key];
					}
					break;
				case "object":
					if (!target.hasOwnProperty(key) || (template[key] instanceof Array && !(target[key] instanceof Array))) {
						target[key] = template[key] instanceof Array ? [] : {};
					}
					stubCopy(target[key], template[key]);
				break;
			}
		});
	};

	var settings = function () {
		Array.prototype.forEach.call(arguments, function (template) {
			stubCopy(settings, template);
		});
	};

	try {
		settings(JSON.parse(localStorage["webclientSettings"]));
	} catch (error) {
	}

	var onStorage = function (event) {
		if (event.key === "webclientSettings") {
			try {
				settings(JSON.parse(event.newValue));
			} catch (error) {
				return;
			}
			events.publish("settings.change");
		}
	};
	window.addEventListener("storage", onStorage, false);

	var saveToStorage = function (event) {
		window.removeEventListener("storage", onStorage, false);
		var clone = {};
		Object.keys(settings).forEach(function (key) {
			clone[key] = settings[key];
		});
		localStorage["webclientSettings"] = JSON.stringify(clone);
		window.addEventListener("storage", onStorage, false);
	};
	window.addEventListener("unload", saveToStorage, false);
	events.subscribe("settings.save", saveToStorage);

	return settings;
});
