/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events", "core/ui", "libraries/mustache", "text!templates/signin.mustache"], function (events, ui, mustache, signinTemplate) {
	events.subscribe("app.ready", function () {
		ui.addNavigation({
			title: "Sign Out",
			callback: function () {
				events.publish("session.signout");
				location.reload();
			}
		});
		document.body.insertAdjacentHTML("beforeEnd", mustache.to_html(signinTemplate));
		document.querySelector("#signin form").addEventListener("submit", function (event) {
			event.preventDefault();
		}, false);
	});
	return {};
});
