/**
 * Marks session start.
 *
 * It's a special plugin with special init functionality
 */
PandaJS.Plugins.Session = PandaJS.PluginBase.extend({
	enable: function(){
		this.pushData({});
	}
});