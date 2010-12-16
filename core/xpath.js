/**	Package: xpath
 *	Easy to use API for XML traversal with XPath.
 *
 *	Returns:
 *		Function
 *
 *	Arguments:
 *		(Element) node - The XML element to traverse.
 *		(String) xpath - The XPath search query.
 *		(Primitive|XPathResultType|"*") type - Optional data type for the query result.
 *												Primitive is *Object*, *Array*, *Boolean*, *String* or *Number*.
 *												The standard <W3C XPathResultType at http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathResult> is also supported.
 *												The "*" (a single asterisk string) means XPathResult.ANY_TYPE (0).
 *		(Object|Function|XPathNSResolver) xmlns - Optional XPathNSResolver, key/value map, or lookup function to match any namespace prefix in the xpath search query to a URI.
 *
 *	Examples:
 *		XML data:
 *		(code)
 *		<feed xmlns="http://www.w3.org/2005/Atom">
 *			<entry>
 *			...
 *			</entry>
 *		</feed>
 *		(end)
 *		Traverse all entries:
 *		(code)
 *		xpath(XMLfeed, "/atom:feed/atom:entry", Array,
 *		{atom: "http://www.w3.org/2005/Atom"}).forEach(function (entry) {
 *			// do something with entry
 *		});
 *		(end)
 *		Dynamic lookup of the namespace and getting the first element:
 *		(code)
 *		var firstEntry = xpath(XMLfeed, "/atom:feed/atom:entry", Object, function (prefix) {
 *			return prefix === "atom" ? "http://www.w3.org/2005/Atom" : null;
 *		});
 *		(end)
 */
define(function () {return function (node, xpath, type, xmlns) {
	var result = null;

	/* Auto-detect the XPathResultType */
	switch (type) {
		case "*":
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
		case undefined:
		case Object:
			type = XPathResult.FIRST_ORDERED_NODE_TYPE;
			break;
	}

	/* Accept either a Function or key-value pairs as XPathNSResolver */
	if (xmlns === undefined) {
		//xmlns = node.ownerDocument.createNSResolver(node)
		xmlns = null;
	} else if (!(xmlns instanceof Function)) {
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
			result = [];
			var resultNode;
			while (resultNode = query.iterateNext()) {
				result.push(resultNode);
			}
			break;
		case query.UNORDERED_NODE_SNAPSHOT_TYPE:
		case query.ORDERED_NODE_SNAPSHOT_TYPE:
			result = [];
			for (var i = 0; i < query.snapshotLength; i++) {
				result.push(query.snapshotItem(i));
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
