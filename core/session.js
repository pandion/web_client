/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events"], function (events) {
	var showSigninForm = function () {
		require(["core/css", "libraries/mustache", "text!templates/signin.mustache"], function (css, mustache, signinTemplate) {
			document.body.insertAdjacentHTML("beforeEnd", mustache.to_html(signinTemplate));
			css.load("core/signin.css");
			document.querySelector("#signin form").addEventListener("submit", function (event) {
				event.preventDefault();
				if (document.querySelector("#signin form").checkValidity()) {
					document.querySelector("#signin-invalid").classList.add("hide");
					var address = document.querySelector("#signin-address").value;
					var password = document.querySelector("#signin-password").value;
					events.publish("session.signin", address, password);
				} else {
					document.querySelector("#signin-invalid").classList.remove("hide");
					return false;
				}
			}, false);
		});
	};
	var showSignoutButton = function () {
		require(["core/ui"], function (ui) {
			ui.addNavigation({
				title: "Sign Out",
				callback: function () {
					events.publish("session.signout");
					location.reload();
				}
			});
		});
	};
	events.subscribe("app.ready", showSigninForm);
	return {};
});
