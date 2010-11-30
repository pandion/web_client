/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(["core/events", "core/xpath"], function (events, xpath) {
	/* Strophe instance */
	var stropheConnection;

	/* Default namespaces and prefixes to be used in XPath */
	var xpathXmlns = {
		/* RFC 3920 - Core */
		client: "jabber:client",
		server: "jabber:server",
		stream: "http://etherx.jabber.org/streams",
		tls: "urn:ietf:params:xml:ns:xmpp-tls",
		sasl: "urn:ietf:params:xml:ns:xmpp-sasl",
		bind: "urn:ietf:params:xml:ns:xmpp-bind",
		error: "urn:ietf:params:xml:ns:xmpp-stanzas",
		/* RFC 3921 - IM */
		session: "urn:ietf:params:xml:ns:xmpp-session"
	};

	/* Combine various namespace maps/resolvers */
	var xpathNamespaceResolver = function (prefix) {
		var handler = this;
		var uri = null;
		if (handler.xmlns instanceof Function) {
			uri = handler.xmlns(prefix);
		}
		if (uri === null) {
			if (handler.xmlns && handler.xmlns.hasOwnProperty(prefix)) {
				uri = handler.xmlns[prefix];
			} else if (xpathXmlns.hasOwnProperty(prefix)) {
				uri = xpathXmlns[prefix];
			}
		}
		return uri;
	};

	/* Buffer outgoing stanzas */
	var stanzaSendQueue = [];

	/* Filters and callbacks to work with the XMPP stream */
	var stanzaHandlers = {
		active: [],
		add: [],
		remove: []
	};

	/* Track id attributes of outgoing IQ stanzas with their callback function */
	var iqCallbacks = {
		// "abc123": function (iq) {},
		// ...
	};

	/* xmpp module interface */
	var stream = {
		connection: {
			authentication: "none",
			encryption: "none",
			status: "disconnected",
		},
		features: null,
		subscribe: function (handler) {
		/*
		handler: {
			xpath: "/message/body",
			xmlns: {
				"stream": "http://etherx.jabber.org/streams",
				"pubsub": "http://jabber.org/protocol/pubsub",
				// ...
			},
			type: XPathResultType || Object || Array || Number || String || Boolean,
			filter: Boolean || Function, // function (stanza) {return Boolean}
			callback: function (stanza[, xpathResult]) {return Boolean} // return value "true" means keep the handler listening, else drop it
		}
		*/
			stanzaHandlers.add.push(handler);
		},
		unsubscribe: function (handler) {
			stanzaHandlers.remove.push(handler);
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
		},
		sendIQ: function (iq, callback) {
			if (callback instanceof Function) {
				var id = iq.getAttribute("id");
				if (id === null || id === "") {
					do {
						id = Math.floor(Math.random() * 0xffffffff).toString(16);
					} while (iqCallbacks.hasOwnProperty(id));
					iq.setAttribute("id", id);
				}
				iqCallbacks[id] = callback;
			}
			stream.send(iq);
		}
	};

	/* Splits all child elements of a node into new DOM Documents */
	var forEachChildElement = function (parent, callback) {
		var childNodes = parent.childNodes;
		var length = childNodes.length;
		for (var i = 0; i < length; i++) {
			var child = childNodes.item(i);
			if (child.nodeType === child.ELEMENT_NODE) {
//				callback((new DOMParser).parseFromString((new XMLSerializer()).serializeToString(child), "text/xml").documentElement);
				var xmlDom = document.implementation.createDocument("", "root", null);
				child = xmlDom.importNode(child, true);
				xmlDom.replaceChild(child, xmlDom.documentElement);
				callback(child);
			}
		}
	};

	var onStropheStanzaReceive = function (boshBody) {
		forEachChildElement(boshBody, function (stanza) {
			console.log("[XMPP] Receiving:", stanza);
			/* Clean up unused handles */
			while (stanzaHandlers.remove.length) {
				var markedHandler = stanzaHandlers.remove.pop();
				var position = stanzaHandlers.remove.indexOf(markedHandler);
				if (position !== -1) {
					stanzaHandlers.remove.splice(position, 1);
				}
			}
			/* Insert new handlers */
			if (stanzaHandlers.add.length) {
				stanzaHandlers.active = stanzaHandlers.active.length ?
					stanzaHandlers.active.concat(stanzaHandlers.add) :
					stanzaHandlers.add;
				stanzaHandlers.add = [];
			}
			/* Feed stanzas to the handler filters/callbacks */
			stanzaHandlers.active.forEach(function (handler) {
				var accept = true;
				var result;
				if ("xpath" in handler) {
					result = xpath(stanza, handler.xpath, handler.type, xpathNamespaceResolver.bind(handler));
					accept = result !== null;
				} else if (handler.filter instanceof Function) {
					result = handler.filter(stanza);
					accept = !!result;
				}
				if (accept) {
					try {
						/* Reattach the handler if the callback returns a true value */
						if (handler.callback(stanza, result)) {
							stanzaHandlers.add.push(handler);
						}
					} catch (error) {
						console.trace();
						console.error("Error while executing stanza handler callback:", error, error.message);
					}
				} else {
					/* Also reattach the handler if it has not been accepted yet */
					stanzaHandlers.add.push(handler);
				}
			});
			stanzaHandlers.active = [];
		});
	};

	var onStropheStanzaSend = function (boshBody) {
		forEachChildElement(boshBody, function (stanza) {
			console.log("[XMPP] Sending:", stanza);
		});
	};

	var connect = function (address, password) {
		require(["libraries/strophe.js"], function () {
			var boshUrl = "http://bosh.metajack.im:5280/xmpp-httpbind";
//			var boshUrl = "/http-bind/";
			stropheConnection = new Strophe.Connection(boshUrl);
			stropheConnection.xmlInput = onStropheStanzaReceive;
			stropheConnection.xmlOutput = onStropheStanzaSend;
			stropheConnection.connect(address, password, function (status) {
				switch (status) {
					case Strophe.Status.ATTACHED:
						break;
					case Strophe.Status.AUTHENTICATING:
						break;
					case Strophe.Status.CONNECTED:
						stream.connection.status = "connected";
						/* Flush outgoing stanza buffer when (re-)connecting */
						while (stanzaSendQueue.length > 0) {
							stream.send(stanzaSendQueue.shift());
						}
						events.publish("xmpp.connected");
						break;
					case Strophe.Status.CONNECTING:
						stream.connection.status = "connecting";
						events.publish("xmpp.connecting");
						break;
					case Strophe.Status.CONNFAIL:
					case Strophe.Status.AUTHFAIL:
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

	var disconnect = function () {
		stropheConnection.disconnect();
	};

	var doSignin = function (address, password) {
		connect(address, password);
		/* Activate and remove the Cancel button */
		// TODO: Clean up this API syntax
		// - Allow subscribing to multiple events in one call.
		// - Allow unsubscribing based on other events being fired.
		// Example: events.subscribe("session.cancelSignin", disconnect, "xmpp.connected", "xmpp.disconnected")
		events.subscribe("session.cancelSignin", disconnect);
		events.subscribe("xmpp.connected", stopCancel);
		events.subscribe("xmpp.disconnected", stopCancel);
		var stopCancel = function () {
			events.unsubscribe("session.cancelSignin", disconnect);
			events.subscribe("session.signin", doSignin);
			events.unsubscribe("xmpp.disconnected", stopCancel);
			events.unsubscribe("xmpp.connected", stopCancel);
		};
		return true;
	};

	/* Cache the last received stream:features */
	stream.subscribe({
		xpath: "/stream:features",
		type: Object,
		callback: function (stanza) {
			stream.features = stanza;
			return true;
		}
	});

	/* Stream filter for IQ callback handling */
	stream.subscribe({
		filter: function (stanza) {
			var id = stanza.getAttribute("id");
			return stanza.tagName === "iq" && id !== null && id.length > 0 && iqCallbacks.hasOwnProperty(id);
		},
		callback: function (iq) {
			var id = iq.getAttribute("id");
			return iqCallbacks[id](iq);
		}
	});

	events.subscribe("session.signin", doSignin);

	return stream;
});
