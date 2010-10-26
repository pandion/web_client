/**
	This file is part of Web Client
	@author Copyright (c) 2010 Sebastiaan Deckers
	@license GNU General Public License version 3 or later
*/
define(function () {
	var callbacks = {};

	var iterators = (function () {
		var counters = {};
		return {
			increment: function (name) {
				if (counters.hasOwnProperty(name)) {
					counters[name]++;
				} else {
					counters[name] = 1;
				}
			},
			decrement: function (name) {
				if (counters.hasOwnProperty(name)) {
					counters[name]--;
					if (counters[name] === 0) {
						delete counters[name];
					}
				}
			},
			isEmpty: function (name) {
				return !(counters.hasOwnProperty(name) && counters[name] !== 0);
			}
		};
	})();

	return {
		subscribe: function (name, callback) {
			if (!callbacks.hasOwnProperty(name)) {
				callbacks[name] = [];
			}
			if (callbacks[name].indexOf(callback) === -1) {
				callbacks[name].push(callback);
			}
		},
		unsubscribe: function (name, callback) {
			if (callbacks.hasOwnProperty(name)) {
				var position = callbacks[name].indexOf(callback);
				if (position !== -1) {
					if (iterators.isEmpty(name)) {
						// Safe to manipulate listener array,
						// no events are currently being broadcast.
						callbacks[name].splice(position, 1);
						if (callbacks[name].length === 0) {
							delete callbacks[name];
						}
					} else {
						// Not safe to edit callback array during publish,
						// mark the callback for post-subscribe cleanup.
						callbacks[name][position] = null;
					}
				}
			}
		},
		publish: function (name) {
			console.log(name);
			if (callbacks.hasOwnProperty(name)) {
				// Count recursive publish/unsubscribe calls
				iterators.increment(name);

				var payload = Array.prototype.slice.call(arguments, 1);
				callbacks[name].forEach(function (callback) {
					if (callback instanceof Function) {
						try {
							callback.apply(callback, payload);
						} catch (error) {
						}
					}
				});

				iterators.decrement(name);
				if (iterators.isEmpty(name)) {
					// Perform cleanup to compact sparse callbacks array
					callbacks[name] = callbacks[name].filter(function (callback) {
						return callback instanceof Function;
					});
					if (callbacks[name].length === 0) {
						delete callbacks[name];
					}
				}
			}
		}
	}
});
