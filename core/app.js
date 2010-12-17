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
		css.load("reset");
		css.load("core/app");
		events.publish("app.ready");
		return {};
	}
);
