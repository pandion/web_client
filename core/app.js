define(
	[
		"libraries/polyfill",
		"core/events",
		"core/css",
		"core/session",
		"core/xmpp",
		"core/loader"
	],
	function (polyfill, events, css) {
		css.load("reset.css");
		css.load("core/app.css");
		events.publish("app.ready");
		return {};
	}
);
