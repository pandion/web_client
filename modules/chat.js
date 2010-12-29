define(
["core/ui", "modules/roster", "core/xmpp"],
function (ui, roster, xmpp) {
	var $xml = function (snippet) {
		return (new DOMParser).parseFromString(snippet, "text/xml").documentElement;
	};

	var showMessage = function (text) {
		var output = document.createElement("p");
		output.insertAdjacentText("beforeEnd", text);
		document.querySelector("#chatlog").appendChild(output);
	};

	var submitComposer = function (jid) {
		event.preventDefault();
		var message = $xml("<message><body/></message>");
		message.setAttribute("to", jid);
		var input = document.querySelector("#chatcomposer textarea");
		message.firstChild.textContent = input.value;
		showMessage(input.value);
		input.value = "";
		xmpp.send(message);
	};

	var xmppMessageHandler = {
		xpath: "/client:message/client:body",
		xmlns: {client: "jabber:client"},
		type: Object,
		callback: function (message, body) {
			showMessage(body.textContent);
			return true;
		}
	};

	new ui.content({
		path: /^chat\/?([^\/]*)/,
		open: function (path, element) {
			var jid = path.match(/^chat\/?([^\/]*)/)[1];
			var name = jid in roster ? roster[jid].name : jid;
			require(["core/template"], function (template) {
				template({css: "modules/chat", source: "chat", container: element, data: {name: name, jid: jid}}, function () {
					element.querySelector("#chatcomposer").addEventListener("submit", function () {submitComposer(jid)}, false);
					xmpp.subscribe(xmppMessageHandler);
				});
			});
		},
		close: function (path, element) {
			require(["core/css"], function (css) {
				css.unload("modules/chat");
				xmpp.unsubscribe(xmppMessageHandler);
			});
		}
	});

	return {};
});
