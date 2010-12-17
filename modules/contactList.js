define(
["core/events", "core/ui", "modules/roster", "core/template"],
function (events, ui, roster, template) {
	var gadgetTitle = null;
	var gadgetContent = null;
	var jidToHTMLCache = {};

	ui.addGadget({open: function (title, content) {
		gadgetTitle = title;
		gadgetContent = content;
		gadgetTitle.textContent = "Chat";
		template({css: "modules/contactList", source: "contactList", container: gadgetContent});
	}});

	events.subscribe("roster.change", function (changedContacts) {
		gadgetContent.querySelector("p").classList.add("hide");
		var list = gadgetContent.querySelector("ul");
		Object.keys(changedContacts).forEach(function (jid) {
			if (!jidToHTMLCache[jid]) {
				jidToHTMLCache[jid] = document.createElement("li");
				list.insertAdjacentElement("beforeEnd", jidToHTMLCache[jid]);
			}
			template({
				container: jidToHTMLCache[jid],
				source: "contactListItem",
				data: {
					jid: jid,
					name: changedContacts[jid].name,
					ask: changedContacts[jid].ask,
					subscription: changedContacts[jid].subscription
				}
			});
		});
	});

	return {};
});
