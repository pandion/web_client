/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
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
