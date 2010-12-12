/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(function () {
	var cache = {};

	// TODO: Implement Stringprep
	var nodeprep = function (node) {
		return node.toLowerCase();
	};
	var domainprep = function (domain) {
		return domain.replace(/(.*)\.$/, "$1").toLowerCase();
	};
	var resourceprep = function (resource) {
		return resource;
	};

	var stringToBytesArray = function (string) {
		var character,
			stack,
			result = []
		;
		for (var i = 0; i < string.length; i++) {
			character = string.charCodeAt(i);
			stack = [];
			do {
				stack.unshift(character & 0xFF);
				character = character >> 8;
			} while (character);
			result = result.concat(stack);
		}
		return result;
	};

	var parse = function (jid) {
		var nodeEnd = jid.indexOf("@");
		var domainEnd = jid.indexOf("/", nodeEnd);

		var node = nodeprep(jid.substring(0, nodeEnd));
		var domain = domainprep(jid.substring(nodeEnd + 1, domainEnd === -1 ? jid.length : domainEnd));
		var resource = resourceprep(domainEnd === -1 ? "" : jid.substring(domainEnd + 1));

		var bare = node.length ? (node + "@" + domain) : domain;
		var full = resource.length ? (bare + "/" + resource) : bare;

		var valid = domain.length &&
			(nodeEnd === -1 || (node.length > 0 && stringToBytesArray(node).length < 1024)) &&
			(domainEnd === -1 || (resource.length > 0 && stringToBytesArray(resource).length < 1024));

		return valid ? {
			// Portions
			node: node,
			domain: domain,
			resource: resource,
			// Composites
			bare: bare,
			full: full
		} : null;
	};

	return function (jid) {
		return Object.hasOwnProperty.call(cache, jid) || (cache[jid] = parse(jid));
	};
});
