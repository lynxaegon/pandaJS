PandaJS.Logger = PandaJS.BaseClass.extend({
	init: function(type){
		this._type = type;
		this._proxy = window._pandaJSconsole;
	},
	log: function(){
		Array.prototype.unshift.call(arguments, "[" + this._type + "]");
		this._proxy.log.apply(this.proxy, arguments);
	},
	error: function(){
		Array.prototype.unshift.call(arguments, "[" + this._type + "]");
		this._proxy.error.apply(this.proxy, arguments);
	}
});