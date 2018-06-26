/**
 * Ajax Proxy
 */
PandaJS.Plugins.AjaxProxy = PandaJS.PluginBase.extend({
	proxy: {},
	readyState: [
		"UNSENT",
		"OPENED",
		"HEADERS_RECEIVED",
		"LOADING",
		"DONE"
	],
	requests: [],
	enable: function(){
		var self = this;
		this.proxy = {
			open: window.XMLHttpRequest.prototype.open,
			send: window.XMLHttpRequest.prototype.send
		};

		window.XMLHttpRequest.prototype.open = function(method, url) {
			this._url = url;
			return self.proxy.open.apply(this, arguments);
		};
		window.XMLHttpRequest.prototype.send = function() {
			var pointer = this;

			var request = {
				id: PandaJS.Utils.guid(),
				url: PandaJS.Utils.resolveURL(pointer._url),
				readyState: 0,
				_started: Date.now(),
				params: PandaJS.Utils.paramsToArray(arguments),
				status: pointer.status,
				_isDirty: true,
				duration: -1,
				update: function(pointer){
					this.duration = Date.now() - this._started;
					this.status = pointer.status;
					this.readyState = pointer.readyState;
					this.response = pointer.responseText;
					this._isDirty = true;
					self.pushData();
				}
			};
			self.requests.push(request);

			var intervalId = window.setInterval(function(){
				if(pointer.readyState !== request.readyState)
					request.update(pointer);

				if(pointer.readyState != 4){
					return;
				}
				clearInterval(intervalId);
			}, 1);
			return self.proxy.send.apply(this, [].slice.call(arguments));
		};
	},
	pushData: function(){
		var self = this;
		var data = [];
		for(var i in self.requests){
			if(!self.requests.hasOwnProperty(i) || !self.requests[i]._isDirty)
				continue;

			self.requests[i]._isDirty = false;
			data.push(self.requests[i]);
		}

		this._super(data);
	}
});