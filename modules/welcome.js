define(
["core/ui"],
function (ui) {
	ui.addContent({
		path: /^$/,
		open: function (path, element) {
			require(
			["core/css", "libraries/mustache", "text!templates/welcome.mustache"],
			function (css, mustache, welcomeTemplate) {
				if (element) {
					css.load("modules/welcome.css");
					element.insertAdjacentHTML("afterBegin", mustache.to_html(welcomeTemplate));
				}
			});
		},
		close: function () {
			require(["core/css"], function (css) {
				css.unload("modules/searchPage.css");
			});
		}
	});
	return {};
});
