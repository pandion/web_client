﻿/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(
	[
		"libraries/polyfill",
		"core/events",
		"core/settings",
		"core/css",
		"core/session",
		"core/help",
		"core/search",
		"modules/twitterSearch",
		"core/xmpp"
	],
	function (polyfill, events, settings, css) {
		css.load("reset.css");
		events.publish("app.ready");
		return {};
	}
);
