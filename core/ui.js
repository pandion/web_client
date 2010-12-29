define(
["core/ui/navigation", "core/ui/gadget", "core/ui/content", "core/ui/dock",
"core/paths", "core/css", "libraries/mustache", "text!templates/ui.mustache"],
function (  navigation, gadget, content, dock,
			paths, css, mustache, uiTemplate) {

	css.load("core/ui");
	document.body.insertAdjacentHTML("beforeEnd", mustache.to_html(uiTemplate));
	var activeContentCreator = null;

	document.body.addEventListener("click", function (event) {
		if (event.target.tagName === "A") {
			var href = event.target.getAttribute("href").trim();
			if (href !== "#" && !/^(http|https)+:\/\//.test(href)) {
				event.preventDefault();
				paths.publish(href);
			}
		}
	}, false);

	return {
		navigation: navigation,
		gadget: gadget,
		content: content,
		dock: dock
	};
});
