var BaseClass = require("../class");
var _ = require('underscore');

module.exports = BaseClass.extend({
	init: function(){
		this.activeList = [];
		this.deleteList = [];
		this.callbacks = [];

		this.initTTLdelete();
	},
	initTTLdelete: function(){
		var self = this;
		setInterval(function(){
			var now = +new Date();
			var deletedItemsCnt = self.deleteList.length;
			self.deleteList = _.filter(self.deleteList, function(item){
				if(item.ttl > now)
					return true;
			});
			deletedItemsCnt = deletedItemsCnt - self.deleteList.length;

			_.each(self.activeList, function(master){
				master.cleanup(now);
			});
			_.each(self.deleteList, function(master){
				master.obj.cleanup(now);
			});

			if(deletedItemsCnt > 0){
				if(self.callbacks["change"]){
					self.callbacks["change"](self.getAll());
				}
			}
		}, 1000);
	},
	mergeIfExists: function(master){
		var foundMaster = _.find(this.deleteList, function(item){
			return item.obj.getGUID() === master.getGUID();
		});
		if(foundMaster){
			master.merge(foundMaster.obj);
			foundMaster.ttl = 0;
			this.deleteList = _.filter(this.deleteList, function(item){
				if(item.ttl > +new Date())
					return true;
			});
		}
	},
	find: function(guid){
		return _.find(this.activeList, function(item){
			return item.getGUID() === guid;
		});
	},
	getAll: function(){
		return {
			active: _.reduce(this.activeList, function(memo, item){
				memo.push({
					lastActive: item.getLastActive(),
					guid: item.getGUID()
				});
				return memo;
			}, []),
			inactive: _.reduce(this.deleteList, function(memo, item){
				memo.push({
					lastActive: item.obj.getLastActive(),
					guid: item.obj.getGUID()
				});
				return memo;
			}, [])
		};
	},
	on: function(event, callback){
		this.callbacks[event] = callback;
	},
	add: function(master){
		this.activeList.push(master);
		this.mergeIfExists(master);

		if(this.callbacks["change"]){
			this.callbacks["change"](this.getAll());
		}
	},
	update: function(master, data){
		if(master){
			master.update(data);
		}
		this.mergeIfExists(master);

		if(this.callbacks["change"]){
			this.callbacks["change"](this.getAll());
		}
	},
	remove: function(master, timeout){
		timeout = timeout || 60;

		var idx = this.activeList.indexOf(master);
		if(idx !== -1){
			this.deleteList.push({
				ttl: +new Date() + timeout * 1000,
				obj: this.activeList.splice(idx, 1)[0]
			});
		}

		if(this.callbacks["change"]){
			this.callbacks["change"](this.getAll());
		}
	}
});