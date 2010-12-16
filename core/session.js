define(["core/events", "core/settings", "core/css"], function (events, settings, css) {
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
		showWarning();
		$("#signin-remember").checked = settings.session.remember;
		$("#signin-address").value = settings.session.remember ? settings.session.address : "";
		$("#signin-password").value = settings.session.remember ? settings.session.password : "";

		var saveSettings = function () {
			settings.session.remember = $("#signin-remember").checked;
			settings.session.address = settings.session.remember ? $("#signin-address").value : "";
			settings.session.password = settings.session.remember ? $("#signin-password").value : "";
		};

		$("#signin-remember").addEventListener("change", saveSettings, false);

		$("#signin-credentials form").addEventListener("submit", function (event) {
			event.preventDefault();
			if ($("#signin-credentials form").checkValidity()) {
				$("#signin-invalid").classList.add("hide");
				saveSettings();
				doSignin($("#signin-address").value, $("#signin-password").value);
			} else {
				$("#signin-invalid").classList.remove("hide");
				return false;
			}
		}, false);
	};

	var doSignin = function (address, password) {
		showPanel("#signin-connecting");
		$("#signin-cancel").addEventListener("click", function (event) {
			event.preventDefault();
			events.publish("session.cancelSignin");
		}, false);

		events.subscribe("xmpp.connecting", function () {
			events.subscribe("xmpp.connected", onConnected);
			events.subscribe("xmpp.disconnected", onDisconnected);
		});

		events.publish("session.signin", address, password);
	};

	var onConnected = function () {
		events.unsubscribe("xmpp.disconnected", onDisconnected);
		$("#signin").parentNode.removeChild($("#signin"));
		css.unload("core/signin.css");
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
					settings.session.address = "";
					settings.session.password = "";
					location.reload();
				}
			});
		});
	};

	settings({
		session: {
			address: "",
			password: "",
			remember: true
		}
	});

	events.subscribe("app.ready", function () {
		require(["libraries/mustache", "text!templates/signin.mustache"], function (mustache, signinTemplate) {
			$("body").insertAdjacentHTML("beforeEnd", mustache.to_html(signinTemplate));
			css.load("core/signin.css");
			if (settings.session.remember === true
				&& settings.session.address.length > 0
				&& settings.session.password.length > 0
			) {
				doSignin(settings.session.address, settings.session.password);
			} else {
				showSigninForm();
			}
		});
	});
	return {};
});
