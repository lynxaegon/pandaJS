PandaJS.Buffer = PandaJS.BaseClass.extend({
	init: function(type, onData){
		this._type = type;
		this._data = [];
		this.onData = onData;
	},
	push: function(data){
		if(!data)
			return;

		this._data.push({
			plugin: this._type,
			data: data
		});

		this.onData();
	},
	flush: function(){
		return this._data.splice(0);
	}
});