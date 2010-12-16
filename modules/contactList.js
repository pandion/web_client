define(
["core/events", "core/ui", "modules/roster", "libraries/mustache", "text!templates/contactList.mustache"],
function (events, ui, roster, mustache, contactListTemplate) {
	var gadgetTitle = null;
	var gadgetContent = null;
	var jidToHTMLCache = {};

	ui.addGadget({open: function (title, content) {
		(gadgetTitle = title).textContent = "Chat";
		(gadgetContent = content).insertAdjacentHTML("beforeEnd", mustache.to_html(contactListTemplate));
	}});

	events.subscribe("roster.change", function (changedContacts) {
		gadgetContent.querySelector("p").classList.add("hide");
		Object.keys(changedContacts).forEach(function (jid) {
			if (!jidToHTMLCache[jid]) {
				jidToHTMLCache[jid] = document.createElement("li");
				gadgetContent.querySelector("ul").insertAdjacentElement("beforeEnd", jidToHTMLCache[jid]);
			}
			var elem = jidToHTMLCache[jid];
			elem.textContent = jid;
		});
	});

	return {};
});
