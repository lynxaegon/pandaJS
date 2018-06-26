/**
 * Aggregates the Ajax & Console plugin into one plugin
 */
PandaJS.AdminPlugins.AjaxAndConsoleAggregator = PandaJS.AdminPluginBase.extend({
	onRecv: function(data){
		this.logger.log("recv:", data);
	},
	getName: function(){
		return "Ajax & Console";
	},
	getIcon: function(){
		return "aperture";
	},
	onShow: function(){
		var $ajax = this.client.plugins.AjaxProxy.onShow();
		var $console = this.client.plugins.ConsoleProxy.onShow();

		var $row1 = $("<div></div>").addClass("row").append(
			$("<div></div>").addClass("col-md-12 pandajs-50-vh scroll plugin-ajax-proxy-scrollable")
				.append($ajax)
		);
		var $row2 = $("<div></div>").addClass("row").append(
			$("<div></div>").addClass("col-md-12 pandajs-50-vh")
				.append($console)
		);

		var $separator = $('<hr/>');

		this.client.container
			.append($row1)
			.append($separator)
			.append($row2);
	},
	onHide: function(){

	},
	onReset: function(){
		// do nothing
	}
});