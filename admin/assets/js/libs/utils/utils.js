PandaJS.Utils = new (PandaJS.BaseClass.extend({
	throttle: function (fn, threshhold, scope) {
		threshhold || (threshhold = 250);
		var last,
			deferTimer;
		return function () {
			var context = scope || this;

			var now = +new Date,
				args = arguments;
			if (last && now < last + threshhold) {
				// hold on to it
				clearTimeout(deferTimer);
				deferTimer = setTimeout(function () {
					last = now;
					fn.apply(context, args);
				}, threshhold);
				return false;
			} else {
				last = now;
				fn.apply(context, args);
				return true;
			}
		};
	},
	resolveURL: function (url) {
		var a = document.createElement('a');
		a.href = url;
		url = a.href;
		return url;
	},
	paramsToArray: function (params) {
		if (!params || !params[0])
			return [];
		params = params[0];
		var request = {};
		var pairs = params.split('&');
		for (var i = 0; i < pairs.length; i++) {
			if (!pairs[i])
				continue;
			var pair = pairs[i].split('=');
			request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
		}
		return request;
	},
	guid: function () {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	},
	stringify: (function(obj, cmd, prop){
		var isArray = Array.isArray || function (a) {
			return Object.prototype.toString.call(a) === "[object Array]";
		};
		function replaceWithNum(s) {
			var st = '' + s;
			return st.replace(/([0-9]+)(px|em||)/g, '[number]$1$2[/number]');
		}

		function getSize(targetElement) {
			var w,
				h;
			if (targetElement) {
				w = getStyle(targetElement, 'width');
				h = getStyle(targetElement, 'height');
				return '[number]' + w + '[/number]' + ' by ' + '[number]' + h + '[/number]';
			}
			return '';
		}

		function getStyle(targetElement, styleProp) {
			if (targetElement) {
				if (targetElement.currentStyle) return targetElement.currentStyle[styleProp];
				else if (window.getComputedStyle) return document.defaultView.getComputedStyle(targetElement, null).getPropertyValue(styleProp);
			}
		}

		return function(obj, cmd, prop){
			if (typeof obj !== 'object') return obj;
			var cache = [], k_map = [], t_array, i, d_node = {}, nid = '', nclass = '', ps,
				s = JSON.stringify(obj, function (k, v) {
					if (!v) return v;
					if (v.nodeType) {
						if (v.id) nid = v.id;
						if (v.className) nclass = v.className;
						if (cmd === 'size') {
							return '[tag]<' + v.nodeName + '>[/tag] ' + getSize(v);
						}
						else if (cmd === 'css') {
							if (isArray(prop)) {
								prop.forEach(function (p) {
									d_node[p] = replaceWithNum(getStyle(v, p));
								});
								return d_node;
							}
							else if (prop) {
								ps = ' ' + prop + ':' + getStyle(v, prop) + ';';
								if (nid) nid = " [attr]id=[/attr][string]'" + nid + "'[/string]";
								if (nclass) nclass = " [attr]class=[/attr][string]'" + nclass + "'[/string]";
								return '[tag]<' + v.nodeName + '' + nid + '' + nclass + '>[/tag]' + replaceWithNum(ps);
							}
						}
						else {
							d_node.element = v.nodeName;
							if (nid) d_node.id = nid;
							if (nclass) d_node["class"] = nclass;
							d_node.visible = VISIBILITY.isVisible(v);
							d_node.size = getSize(v);
							d_node.html = v.outerHTML;
						}
						return d_node;
					}
					if (v.window && v.window == v.window.window) return '{Window Object}';
					if (typeof v === 'function') return '[Function]';
					if (typeof v === 'object' && v !== null) {
						if (v.length && (t_array = Array.prototype.slice.call(v)).length === v.length) v = t_array;
						i = cache.indexOf(v);
						if (i !== -1) {
							return '[ Circular {'+(k_map[i]||'root')+'} ]';
						}
						cache.push(v);
						k_map.push(k);
					}
					return v;
				});
			return s;
		}
	})(),
	extend: function() {
		var extended = {};

		for(var key in arguments) {
			var argument = arguments[key];
			for (var prop in argument) {
				if (Object.prototype.hasOwnProperty.call(argument, prop)) {
					extended[prop] = argument[prop];
				}
			}
		}

		return extended;
	},
	onReady: function(callback) {
		if (document.readyState != 'loading') {
			callback();
		}
		else if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', callback);
		}
		else {
			document.attachEvent('onreadystatechange', function () {
				if (document.readyState == 'complete')
					callback();
			});
		}
	}
}));