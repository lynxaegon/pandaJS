PandaJS.AdminClient = PandaJS.BaseClass.extend({
	_connectionString: "http://localhost:8081",
	_socket: false,
	_buffer: [],
	logger: false,
	defaults: {
		id: false,
		defaultPlugin: "AjaxAndConsoleAggregator"
	},
	options: false,
	plugins: {},
	pluginElements: {},
	_selectedPlugin: false,
	init: function(connectionString, options){
		var self = this;
		this._connectionString = connectionString || this._connectionString;
		this.options = PandaJS.Utils.extend(this.defaults, options);

		window._pandaJSconsole = window.console;
		this.logger = new PandaJS.Logger("PandaJS");

		if(!this.options.id){
			this.options.id = PandaJS.Utils.guid();
		}

		this._connect();

		for(var i in PandaJS.AdminPlugins){
			if(!PandaJS.AdminPlugins.hasOwnProperty(i))
				continue;

			this.plugins[i] = new PandaJS.AdminPlugins[i](this._getClient(i), new PandaJS.Logger(i));
			var item = this.plugins[i].inject();
			if(item) {
				this.pluginElements[i] = item;
				(function(plugin){
					item.on("click", function(){
						if(self._selectedPlugin == plugin)
							return;

						if(self._selectedPlugin)
							self._selectedPlugin.onHide();

						$(".panda-main-container").empty();

						self._selectedPlugin = plugin;
						self._selectedPlugin.onShow();
					});
				})(this.plugins[i]);
			}
		}

		// show default plugin
		if (this.pluginElements[this.options.defaultPlugin]) {
			this.pluginElements[this.options.defaultPlugin].click();
		}

		feather.replace();

		return this;
	},
	// region internals
	_connect: function(){
		var self = this;
		// connect to socket.io
		self.socket = io(self._connectionString);
		self.socket.on('connect', function(data){
			self.socket.emit("/client/setup", {
				guid: self.options.id
			});
			while(self._buffer.length > 0){
				self.sendRaw.apply(self, self._buffer.shift());
			}
		});
		self.socket.on("/recv", function(data){
			// special plugin
			if(data.plugin == "Session"){
				_.each(self.plugins, function(plugin){
					plugin.onNewSession();
				});
			}
			else {
				if (self.plugins[data.plugin]) {
					self.plugins[data.plugin].onRecv(data.data);
				} else {
					self.logger.error("Plugin '" + data.plugin + "' doesn't exist!");
				}
			}
		});
		self.socket.on('disconnect', function(){

		});
	},
	_getClient: function(type){
		return (function(type, self){
			return {
				container: $(".panda-main-container"),
				plugins: self.plugins,
				send: function(data){
					self.send(type, data);
				},
				sendRaw: function(){
					self.sendRaw.apply(self, arguments);
				}
			};
		})(type, this);
	},
	send: function(type, data){
		return this.sendRaw("/client/data", {
			plugin: type,
			data: data
		});
	},
	sendRaw: function(){
		var args = Array.from(arguments);
		if(!this.socket.connected) {
			this._buffer.push(args);
			return false;
		}

		this.socket.emit.apply(this.socket, args);
		return true;
	}
	// endregion
});
