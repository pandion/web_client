define(
["core/events", "core/ui", "modules/roster", "core/template", "core/settings"],
function (events, ui, roster, template, settings) {
	settings({contactList: {
		visible: false
	}});
	var htmlCache = {
/*		"groupA": {
			html: Element, // li > header + ul
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
			dock.content.querySelector("ul").insertAdjacentElement("beforeEnd", groupHtml);
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
	var removeGroupFromCache = function (group) {
		if (htmlCache[group]) {
			var cachedGroup = htmlCache[group];
			cachedGroup.html.parentElement.removeChild(cachedGroup.html);
			delete htmlCache[group];
		}
	};
	var removeContactFromCache = function (group, jid) {
		if (htmlCache[group] && htmlCache[group].contacts[jid]) {
			var cachedGroup = htmlCache[group];
			var contact = cachedGroup.contacts[jid];
			contact.parentElement.removeChild(contact);
			delete cachedGroup.contacts[jid];
			if (Object.keys(cachedGroup.contacts).length === 0) {
				removeGroupFromCache(group);
			}
		}
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

	var dock = new ui.dock({
		title: "Contacts",
		sticky: true,
		close: false,
		visible: settings.contactList.visible,
		events: {
			toggle: function (dock) {
				settings.contactList.visible = dock.visible;
			}
		}
	});
	template({css: "modules/contactList", source: "contactList", container: dock.content});

	events.subscribe("roster.change", function (changedContacts) {
		dock.content.querySelector("p").classList.add("hide");
		var groupsToUpdate = {};
		Object.keys(changedContacts).forEach(function (jid) {
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
			// Remove from old groups
			Object.keys(htmlCache).filter(function (group) {
				return htmlCache[group].hasOwnProperty(jid) &&
					(changedContacts[jid].groups.indexOf(group) === -1);
			}).forEach(function (group) {
				removeContactFromCache(group, jid);
			});
			// Update new groups
			((changedContacts[jid].groups.length > 0) ? changedContacts[jid].groups : ["Other Contacts"])
			.forEach(function (group) {
				groupsToUpdate[group] = true;
				var cachedContact = getContactFromCache(group, jid);
				while (cachedContact.hasChildNodes()) {
					cachedContact.removeChild(cachedContact.firstChild);
				}
				template({
					container: cachedContact,
					source: "contactListItem",
					data: {
						jid: jid,
						name: changedContacts[jid].name,
						ask: changedContacts[jid].ask,
						subscription: changedContacts[jid].subscription,
						resource: resources.length > 0 ? resources[0] : undefined,
						resources: resources
					}
				});
			});
		});
		Object.keys(groupsToUpdate).forEach(updateGroupHeader);
	});

	return {};
});
