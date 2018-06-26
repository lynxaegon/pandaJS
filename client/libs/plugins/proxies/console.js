/**
 * Console Proxy
 */
PandaJS.Plugins.ConsoleProxy = PandaJS.PluginBase.extend({
	proxy: {},
	enable: function(){
		var self = this;
		this.proxy = window.console;

		// serializable support for Error
		if (!('toJSON' in Error.prototype))
			Object.defineProperty(Error.prototype, 'toJSON', {
				value: function () {
					var alt = {};

					Object.getOwnPropertyNames(this).forEach(function (key) {
						alt[key] = this[key];
					}, this);

					return alt;
				},
				configurable: true,
				writable: true
			});

		window.console = {
			log: function(){
				self.pushData({
					type: "log",
					args: arguments
				});
				self.proxy.log.apply(self.proxy, arguments)
			},
			info: function(){
				self.pushData({
					type: "info",
					args: arguments
				});
				self.proxy.info.apply(self.proxy, arguments)
			},
			warn: function(){
				self.pushData({
					type: "warn",
					args: arguments
				});
				self.proxy.warn.apply(self.proxy, arguments)
			},
			debug: function(){
				self.pushData({
					type: "debug",
					args: arguments
				});
				self.proxy.debug.apply(self.proxy, arguments)
			},
			error: function(){
				self.pushData({
					type: "error",
					args: arguments
				});
				self.proxy.error.apply(self.proxy, arguments)
			},
			eval: function(type, data){
				self.pushData({
					type: "eval",
					args: arguments
				});
			}
		};
		for(var i in self.proxy){
			if(!window.console[i]){
				window.console[i] = self.proxy[i];
			}
		}
	}
});