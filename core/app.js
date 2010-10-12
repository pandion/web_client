/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
require.def(["core/events", "core/loader"], function (events, settings) {
	events.publish("app.ready");
	return {};
});
