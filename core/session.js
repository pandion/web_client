/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events"], function (events) {
	/* DOM helpers */
	var $ = document.querySelector.bind(document);
	var $$ = function () {return Array.prototype.slice.call(document.querySelectorAll.apply(document, arguments));};

	var showPanel = function (id) {
		$$("#signin > article").forEach(function (element) {element.classList.add("hide");});
		if (id) {
			$(id).classList.remove("hide");
		}
	};
	var showWarning = function (id) {
		$$("#signin-credentials p.warn").forEach(function (element) {element.classList.add("hide");});
		if (id) {
			$(id).classList.remove("hide");
		}
	};

	var showSigninForm = function () {
		showPanel("#signin-credentials");
		$("#signin-credentials form").addEventListener("submit", function (event) {
			event.preventDefault();
			if ($("#signin-credentials form").checkValidity()) {
				$("#signin-invalid").classList.add("hide");

				showPanel("#signin-connecting");
				$("#signin-cancel").addEventListener("click", function (event) {
					event.preventDefault();
					events.publish("session.cancelSignin");
				}, false);

				events.subscribe("xmpp.connecting", function () {
					events.subscribe("xmpp.connected", onConnected);
					events.subscribe("xmpp.disconnected", onDisconnected); /* TODO: This doesn't work for authfailed event from strophe? */
				});

				events.publish("session.signin", $("#signin-address").value, $("#signin-password").value);
			} else {
				$("#signin-invalid").classList.remove("hide");
				return false;
			}
		}, false);
	};

	var onConnected = function () {
		events.unsubscribe("xmpp.disconnected", onDisconnected);
		$("#signin").parentNode.removeChild($("#signin"));
		showSignoutButton();
	};

	var onDisconnected = function () {
		events.unsubscribe("xmpp.connected", onConnected);
		showPanel("#signin-credentials");
		showWarning("#signin-failed");
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

	events.subscribe("app.ready", function () {
		require(["core/css", "libraries/mustache", "text!templates/signin.mustache"], function (css, mustache, signinTemplate) {
			$("body").insertAdjacentHTML("beforeEnd", mustache.to_html(signinTemplate));
			css.load("core/signin.css");
			/* TODO: Check for saved settings? */
			showSigninForm();
		});
	});

	return {};
});
