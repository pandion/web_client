define(
["core/settings", "core/events", "core/ui"],
function (settings, events, ui) {
	var drawSettings = function () {
		var output = document.querySelector("#settings-viewer");
		while (output.hasChildNodes()) {
			output.removeChild(output.firstChild);
		}
		output.insertAdjacentText("beforeEnd",
			Object.keys(settings).map(
				function (key) {return JSON.stringify(settings[key], null, 2);}
			).join("")
		);
	};
	ui.addContent({
		path: /^settings/,
		open: function (path, element) {
			require(["core/template"], function (template) {
				template({css: "modules/settingsViewer", source: "settingsViewer", container: element}, function () {
					drawSettings();
					events.subscribe("settings.change", drawSettings);
				});
			});
		},
		close: function () {
			events.unsubscribe("settings.change", drawSettings);
			htmlContainer = null;
			require(["core/css"], function (css) {
				css.unload("core/settingsViewer");
			});
		}
	});
	ui.addNavigation({
		title: "Settings",
		path: "settings"
	});
	return {};
});
