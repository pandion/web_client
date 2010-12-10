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

	var parse = function (jid) {
		var nodeEnd = jid.indexOf("@");
		var domainEnd = jid.indexOf("/", nodeEnd);

		var node = nodeprep(jid.substring(0, nodeEnd));
		var domain = domainprep(jid.substring(nodeEnd + 1, domainEnd === -1 ? jid.length : domainEnd));
		var resource = resourceprep(domainEnd === -1 ? "" : jid.substring(domainEnd + 1));

		var bare = node.length ? (node + "@" + domain) : domain;
		var full = resource.length ? (bare + "/" + resource) : bare;

		// Note: This is sometimes wrong. Spec says limit for node and resource is each 1023 bytes, not 1023 characters.
		var valid = domain.length &&
			(nodeEnd === -1 || (node.length > 0 && node.length < 1024)) &&
			(domainEnd === -1 || (resource.length > 0 && resource.length < 1024));

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
