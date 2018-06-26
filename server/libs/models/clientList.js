var BaseClass = require("../class");
var _ = require('underscore');

module.exports = BaseClass.extend({
	init: function(){
		this.list = [];
	},
	add: function(item){
		this.list.push(item);
	},
	remove: function(item){
		var idx = this.list.indexOf(item);
		if(idx !== -1){
			var client = this.list.splice(idx, 1)[0];
			client.deattach();
		}
	},
	publish: function(data){
		_.each(this.list, function(client){
			client.onRecv(data);
		})
	}
});