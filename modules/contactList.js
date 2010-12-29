define(
["core/events", "core/ui", "modules/roster", "core/template"],
function (events, ui, roster, template) {
	var htmlCache = {
/*		"groupA": {
			html: Element, // li + header + ul
			contacts: {
				"jidA": Element, // li
				"jidB": Element // li
			}
		},
		"groupB": {
			html: Element, // li
			contacts: {
				"jidA": Element, // li
				"jidC": Element // li
			}
		}
*/	};
	var getGroupFromCache = function (group) {
		if (!htmlCache[group]) {
			var groupHtml = document.createElement("li");
			groupHtml.appendChild(document.createElement("header"));
			groupHtml.appendChild(document.createElement("ul"));
			htmlCache[group] = {html: groupHtml, contacts: {}};
			gadget.content.querySelector("ul").insertAdjacentElement("beforeEnd", groupHtml);
		}
		return htmlCache[group];
	};
	var getContactFromCache = function (group, jid) {
		var cachedGroup = getGroupFromCache(group);
		if (!cachedGroup.contacts[jid]) {
			var contactHtml = document.createElement("li");
			cachedGroup.contacts[jid] = contactHtml;
			cachedGroup.html.lastChild.insertAdjacentElement("beforeEnd", contactHtml);
		}
		return cachedGroup.contacts[jid];
	};

	var updateGroupHeader = function (group) {
		if (htmlCache[group]) {
			if (Object.keys(htmlCache[group].contacts).length > 0) {
				var groupHeader = htmlCache[group].html.firstChild;
				while (groupHeader.hasChildNodes()) {
					groupHeader.removeChild(groupHeader.firstChild);
				}
				template({
					container: groupHeader,
					source: "contactListGroup",
					data: {name: group}
				});
			} else {
				htmlCache[group].html.parentNode.removeChild(htmlCache[group].html);
				delete htmlCache[group];
			}
		}
	};

	var gadget = new ui.gadget({title: "Chat"});
	template({css: "modules/contactList", source: "contactList", container: gadget.content});

	events.subscribe("roster.change", function (changedContacts) {
		gadget.content.querySelector("p").classList.add("hide");
		var groupsToUpdate = {};
		Object.keys(changedContacts).filter(function (jid) {return jid.indexOf("icq.") === -1}).forEach(function (jid) {
			var resources = Object.keys(changedContacts[jid].resources).map(function (resource) {
				var res = changedContacts[jid].resources[resource];
				return {
					jid: jid,
					priority: res.priority,
					resource: resource,
					show: res.show,
					status: res.status
				};
			}).sort(function (a, b) {
				return b.priority - a.priority;
			});
			var groups = (changedContacts[jid].groups.length > 0) ? changedContacts[jid].groups : ["Unfiled"];
			groups.forEach(function (group) {
				groupsToUpdate[group] = true;
				var cachedContact = getContactFromCache(group, jid);
				template({
					container: cachedContact,
					source: "contactListItem",
					data: {
						jid: jid,
						name: changedContacts[jid].name,
						ask: changedContacts[jid].ask,
						subscription: changedContacts[jid].subscription,
						resources: resources
					}
				});
			});
		});
		Object.keys(groupsToUpdate).forEach(updateGroupHeader);
	});

	return {};
});
