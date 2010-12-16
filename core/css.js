define(function () {
	var baseTheme = "themes/base/";
	var stylesheets = {};
	return {
		load: function (file/*, callback*/) {
			if (!(file in stylesheets)) {
				var link = document.createElement("link");
				link.rel = "stylesheet";
				link.type = "text/css";
				/* Not supported in Gecko/Webkit
				link.addEventListener("load", function (event) {
					callback();
					link.removeEventListener("load", this);
				}, false);
				*/
				link.href = baseTheme + file;
				stylesheets[file] = link;
				document.getElementsByTagName("head")[0].appendChild(link);
			}
		},
		unload: function (file) {
			if (file in stylesheets) {
				var link = stylesheets[file];
				link.parentNode.removeChild(link);
				delete stylesheets[file];
			}
		}
	};
});
