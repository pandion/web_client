/**	Package: settings
 *	Centralised storage for user preferences and application flags.
 *
 *	The settings object can be accessed in several ways.
 *	o Called as a function with a JSON structure of keys/values. The JSON structure will be recursively imported as a default settings template. Non-existing keys will be created with the supplied default values. Already existing values, of the same type, will not be replaced.
 *	o Getting and setting properties of the settings object. Treat settings as a key/value map to manipulate application preferences.
 *
 *	Returns:
 *		Function
 *
 *	Arguments:
 *		(Object) settings - JSON structure to act as default preferences template.
 *
 *	Example:
 *		Setting a default settings template
 *		(code)
 *		settings({
 *			profiles: {
 *				female: {name: "Jane Doe"},
 *				male: {name: "John Doe"},
 *				counter: 0
 *			}
 *		});
 *		(end)
 *
 *		Retrieving settings
 *		(code)
 *		var howMany = settings.profiles.counter++;
 *		var woman = settings.profiles.female.name;
 *		(end)
 *
 *	Event: settings.save
 *	To persist application settings to disk, publish the "settings.save" event. The settings module does not itself publish this event. Other modules can publish this event to trigger data persistence.
 *
 *	Event: settings.change
 *	Published by settings when changes happen to the settings storage backend. Not fired when individual settings are changed.
 */
define(
["core/events"],
function (events) {
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
		settings(JSON.parse(localStorage["Settings"]));
	} catch (error) {
	}

	var onStorage = function (event) {
		if (event.key === "Settings") {
			try {
				settings(JSON.parse(event.newValue));
			} catch (error) {
				return;
			}
			events.publish("settings.change", settings);
		}
	};
	window.addEventListener("storage", onStorage, false);

	var saveToStorage = function (event) {
		window.removeEventListener("storage", onStorage, false);
		var clone = {};
		Object.keys(settings).forEach(function (key) {
			clone[key] = settings[key];
		});
		localStorage["Settings"] = JSON.stringify(clone, null, 2);
		window.addEventListener("storage", onStorage, false);
	};
	window.addEventListener("unload", saveToStorage, false);
	events.subscribe("settings.save", saveToStorage);

	return settings;
});
