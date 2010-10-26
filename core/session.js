/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events", "core/ui"], function (events, ui) {
	events.subscribe("app.ready", function () {
		ui.addNavigation({
			title: "Sign Out",
			callback: function () {
				events.publish("session.signout");
				location.reload();
			}
		});

		var overlay = document.createElement("section");
		overlay.id = "overlay";
		var form = document.createElement("form");

		var addressLabel = document.createElement("label");
		addressLabel.textContent = "IM Address";
		addressLabel.htmlFor = "signin-address";
		form.appendChild(addressLabel);

		var address = document.createElement("input");
		address.type = "email";
		address.id = "signin-address";
		form.appendChild(address);

		var passwordLabel = document.createElement("label");
		passwordLabel.textContent = "Password";
		passwordLabel.htmlFor = "signin-password";
		form.appendChild(passwordLabel);

		var password = document.createElement("input");
		password.type = "password";
		password.id = "signin-password";
		form.appendChild(password);

		var submit = document.createElement("input");
		submit.type = "submit";
		submit.value = "Sign In";
		form.appendChild(submit);

		overlay.appendChild(form);
		document.body.appendChild(overlay);
	});
	return {};
});
