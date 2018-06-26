/**
* Executes console commands via eval
*/
PandaJS.Plugins.CommandExecutor = PandaJS.PluginBase.extend({
	onRecv: function(data){
		console.eval("command", data);
		console.eval("eval", eval(data));
	},
	enable: function(){

	}
});