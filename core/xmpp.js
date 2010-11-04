/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events"], function (events) {
	/* Strophe instance */
	var stropheConnection;

	/* Buffer outgoing stanzas */
	var stanzaSendQueue = [];
	events.subscribe("xmpp.connected", function () {
		while (stanzaSendQueue.length > 0) {
			stream.send(stanzaSendQueue.shift());
		}
	});

	/* xmpp module interface */
	var stream = {
		connection: {
			authentication: "none",
			encryption: "none",
			status: "disconnected"
		},
		listen: function (xpath, callback) {
		},
		send: function (stanza) {
			switch (stream.connection.status) {
				case "connected":
					stropheConnection.send(stanza);
					break;
				case "connecting":
				case "disconnected":
					stanzaSendQueue.push(stanza);
					break;
			}
		}
	};

	/* Sign In hook */
	var connect = function (address, password) {
		require(["libraries/strophe.js"], function () {
			var boshUrl = "http://bosh.metajack.im:5280/xmpp-httpbind";
//			var boshUrl = "/http-bind/";
			stropheConnection = new Strophe.Connection(boshUrl);
			stropheConnection.connect(address, password, function (status) {
				switch (status) {
					case Strophe.Status.ATTACHED:
						break;
					case Strophe.Status.AUTHENTICATING:
						break;
					case Strophe.Status.AUTHFAIL:
						break;
					case Strophe.Status.CONNECTED:
						stream.connection.status = "connected";
						events.publish("xmpp.connected");
						break;
					case Strophe.Status.CONNECTING:
						stream.connection.status = "connecting";
						events.publish("xmpp.connecting");
						break;
					case Strophe.Status.CONNFAIL:
						break;
					case Strophe.Status.DISCONNECTED:
						stropheConnection = null;
						stream.connection.status = "disconnected";
						events.publish("xmpp.disconnected");
						break;
					case Strophe.Status.DISCONNECTING:
						break;
					case Strophe.Status.ERROR:
						break;
				}
			});
		});
	};

	events.subscribe("session.signin", function (address, password) {
		connect(address, password);
	});

	return stream;
});
