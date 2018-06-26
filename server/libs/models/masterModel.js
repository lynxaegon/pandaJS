var BaseClass = require("../class");
var _ = require('underscore');
var Utils = require("../utils");

module.exports = BaseClass.extend({
	logTTL: 5 * 60 * 1000, // 5 min
	init: function(data, socket){
		this.params = {
			guid: data.guid,
			preserveLogs: data.preserveLogs || false
		};
		this.socket = socket;
		this.clients = [];
		this.logs = [];
		this._lastActive = +new Date();
	},
	update: function(data){
		_.each(data, function(val, key){
			this.params[key] = val;
		}, this);
	},
	mustPreserveLogs: function(){
		return this.params.preserveLogs;
	},
	getGUID: function(){
		return this.params.guid;
	},
	merge: function(oldMaster){
		if(this.mustPreserveLogs())
			this.logs = oldMaster.logs.concat(this.logs);

		_.each(oldMaster.clients, function(client){
			client.attachTo(this, this.mustPreserveLogs() ? client.getLastLogId() : null);
		}, this);
	},
	addClient: function(client){
		this.clients.push(client);
		var lastLogId = client.getLastLogId();

		var shouldSend = lastLogId === null;
		_.each(this.logs, function(item){
			if(shouldSend) {
				this.send(item, client);
			}
			if(lastLogId === item.id){
				shouldSend = true;
			}
		}, this);
	},
	removeClient: function(client){
		var idx = this.clients.indexOf(client);
		if(idx !== -1){
			this.clients.splice(idx, 1);
		}
	},
	onData: function(data){
		var obj = false;
		_.each(data, function(item){
			obj = {
				id: Utils.guid(),
				ttl: +new Date() + this.logTTL,
				data: item
			};
			this.logs.push(obj);
			this.broadcast(obj);
		}, this);
		this._lastActive = +new Date();
	},
	onRecv: function(data){
		this.socket.emit("/recv", data);
	},
	cleanup: function(timestamp){
		var count = 0;
		for(var i = 0; i < this.logs.length; i++){
			if(this.logs[i].ttl <= timestamp){
				count++;
			}
			else {
				break;
			}
		}

		_.times(count, function(){
			this.logs.shift();
		}, this);
	},
	getLastActive: function(){
		return this._lastActive;
	},
	send: function(obj, client){
		client.setLastLogId(obj.id);
		client.onRecv(obj.data);
	},
	broadcast: function(data){
		_.each(this.clients, function(client){
			this.send(data, client);
		}, this);
	}
});