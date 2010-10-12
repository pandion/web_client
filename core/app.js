/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
require.def(["modules/events", "modules/loader"], function (events, settings) {
	events.publish("app.ready");
	return {};
});
