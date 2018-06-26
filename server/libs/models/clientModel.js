var BaseClass = require("../class");
var _ = require('underscore');

module.exports = BaseClass.extend({
	init: function(guid, socket){
		this.guid = guid;
		this.socket = socket;
		this.connectedTo = false;
		this.dataQueue = [];
		this.isPublishing = false;
		this.lastLogId = false;
	},
	attachTo: function(master, startFrom){
		startFrom = startFrom || null;
		this.deattach();
		this.connectedTo = master;
		this.setLastLogId(startFrom);
		master.addClient(this);
	},
	deattach: function(){
		if(this.connectedTo){
			this.connectedTo.removeClient(this);
			this.connectedTo = false;
		}
		this.setLastLogId(null);
	},
	setLastLogId: function(id){
		this.lastLogId = id;
	},
	getLastLogId: function(){
		return this.lastLogId;
	},
	isAttached: function(){
		return this.connectedTo;
	},
	getGUID: function(){
		return this.params.guid;
	},
	send: function(data){
		if(this.isAttached()){
			this.connectedTo.onRecv(data);
		}
	},
	onRecv: function(data){
		this.dataQueue.push(data);
		this.publish();
	},
	publish: function(){
		if(this.isPublishing)
			return;

		while(this.dataQueue.length > 0){
			this.isPublishing = true;
			this.socket.emit("/recv", this.dataQueue.shift());
		}
		this.isPublishing = false;
	}
});