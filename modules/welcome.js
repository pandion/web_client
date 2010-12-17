define(
["core/ui"],
function (ui) {
	ui.addContent({
		path: /^$/,
		open: function (path, element) {
			require(["core/template"], function (template) {
				template({css: "modules/welcome", source: "welcome", container: element});
			});
		},
		close: function () {
			require(["core/css"], function (css) {
				css.unload("modules/welcome");
			});
		}
	});
	return {};
});
