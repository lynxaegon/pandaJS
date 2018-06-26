PandaJS.Client = PandaJS.BaseClass.extend({
	_connectionString: "http://localhost:8081",
	_isEnabled: false,
	_socket: false,
	_clientData: {},
	_buffers: [],
	plugins: {},
	logger: false,
	defaults: {
		tick: 100,
		autoStart: true,
		preserveLogs: false,
		id: false
	},
	options: false,
	init: function(connectionString, options){
		this._connectionString = connectionString || this._connectionString;
		this.options = PandaJS.Utils.extend(this.defaults, options);

		// save consoleProxy
		window._pandaJSconsole = window.console;
		this.logger = new PandaJS.Logger("PandaJS");

		// throttle data push loop
		this._flush = PandaJS.Utils.throttle(this._flush, this.options.tick, this);


		// special plugin that needs custom init
		this._buffers.push(new PandaJS.Buffer("Session", this._flush));
		this.plugins["Session"] = new PandaJS.Plugins["Session"](this._buffers[this._buffers.length - 1], new PandaJS.Logger("Session"));
		this.plugins["Session"].enable();

		for(var i in PandaJS.Plugins){
			if(!PandaJS.Plugins.hasOwnProperty(i) || i == "Session")
				continue;

			this._buffers.push(new PandaJS.Buffer(i, this._flush));
			this.plugins[i] = new PandaJS.Plugins[i](this._buffers[this._buffers.length - 1], new PandaJS.Logger(i));
			this.plugins[i].enable();
		}

		this.logger.log("Enabled plugins:", Object.keys(this.plugins));

		if(!this.options.id){
			this.setID(PandaJS.Utils.guid());
		}
		this._connect();

		if(this.options.autoStart)
			this.enable();

		return this;
	},
	setID: function(id){
		this.options.id = id;

		if(this.socket && this.socket.connected){
			this.socket.emit("/master/update", {
				guid: this.options.id
			});
		}
		return this;
	},
	enable: function(){
		this._isEnabled = true;
		return this;
	},
	disable: function(){
		this._isEnabled = false;
		return this;
	},
	// region internals
	_connect: function(){
		var self = this;
		// connect to socket.io
		self.socket = io(self._connectionString);
		self.socket.on('connect', function(data){
			self.socket.emit("/master/setup", {
				guid: self.options.id,
				preserveLogs: self.options.preserveLogs
			});
		});
		self.socket.on("/recv", function(data){
			if(self.plugins[data.plugin]){
				self.plugins[data.plugin].onRecv(data.data);
			} else {
				self.logger.error("Plugin '"+data.plugin+"' doesn't exist!");
			}
		});
		self.socket.on('disconnect', function(){

		});
	},
	_flush: function(){
		// throttled in construct
		if(!this._isEnabled)
			return;

		var data;
		for(var i in this._buffers){
			if(!this._buffers.hasOwnProperty(i))
				continue;
			data = this._buffers[i].flush();

			// send the data
			if(data.length > 0) {
				if(this.socket.connected){
					this.socket.emit("/master/data", data);
					this.logger.log("Emitted data", data);
				}
			}
		}
	}
	// endregion
});
