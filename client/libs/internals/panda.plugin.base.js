/**
 * Base class for all the plugins
 */
PandaJS.Plugins = window.PandaJS.Plugins || {};
PandaJS.PluginBase = PandaJS.BaseClass.extend({
	init: function(buffer, logger){
		this.buffer = buffer;
		this.logger = logger;
	},
	/**
	 * Executed when the plugin is enabled
	 * NOTE: atm plugins are enabled on PandaJS.Client init()
	 **/
	enable: function(){
		this.logger.error("Enable function not implemented!");
	},
	/**
	 * Executed when the plugin is disabled
	 * NOTE: plugin disabling is not yet implemented
	 **/
	disable: function(){
		this.logger.error("Disable function not implemented!");
	},
	/**
	 * Data received from server (from admin interface)
	 **/
	onRecv: function(data){
		this.logger.log("recv:", data);
	},
	/**
	 * Pushes the data into the local buffer
	 **/
	pushData: function(data){
		this.buffer.push(data);
	}
});