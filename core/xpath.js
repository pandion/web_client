﻿/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(function () {return function (node, xpath, type, xmlns) {
	var result = null;

	/* Auto-detect the XPathResultType */
	switch (type) {
		case undefined:
			type = XPathResult.ANY_TYPE;
			break;
		case String:
			type = XPathResult.STRING_TYPE;
			break;
		case Number:
			type = XPathResult.NUMBER_TYPE;
			break;
		case Boolean:
			type = XPathResult.BOOLEAN_TYPE;
			break;
		case Array:
			type = XPathResult.ORDERED_NODE_ITERATOR_TYPE;
			break;
		case Object:
			type = XPathResult.FIRST_ORDERED_NODE_TYPE;
			break;
	}

	/* Accept either a Function or key-value pairs as XPathNSResolver */
	if (xmlns === undefined) {
		//xmlns = node.ownerDocument.createNSResolver(node)
		xmlns = null;
	} else if (!xmlns instanceof Function) {
		var _xmlns = xmlns;
		xmlns = function (prefix) {
			return _xmlns.hasOwnProperty(prefix) ? _xmlns[prefix] : null;
		};
	}

	/* Run the search */
	var query = node.ownerDocument.evaluate(
		xpath,
		node,
		xmlns,
		type,
		null
	);

	/* Give back something useful */
	switch (query.resultType) {
		case query.ANY_UNORDERED_NODE_TYPE:
		case query.FIRST_ORDERED_NODE_TYPE:
			result = query.singleNodeValue;
			break;
		case query.UNORDERED_NODE_ITERATOR_TYPE:
		case query.ORDERED_NODE_ITERATOR_TYPE:
			var resultNodes = [];
			var resultNode;
			while (resultNode = query.iterateNext()) {
				resultNodes.push(resultNode);
			}
			if (resultNodes.length > 0) {
				result = resultNodes;
			}
			break;
		case query.UNORDERED_NODE_SNAPSHOT_TYPE:
		case query.ORDERED_NODE_SNAPSHOT_TYPE:
			var resultNodes = [];
			for (var i = 0; i < query.snapshotLength; i++) {
				resultNodes.push(query.snapshotItem(i));
			}
			if (resultNodes.length > 0) {
				result = resultNodes;
			}
			break;
		case query.NUMBER_TYPE:
			result = query.numberValue;
			break;
		case query.STRING_TYPE:
			result = query.stringValue;
			break;
		case query.BOOLEAN_TYPE:
			result = query.booleanValue;
			break;
	}

	return result;
};});