/**
 * Base class for all the admin plugins
 */
PandaJS.AdminPlugins = window.PandaJS.AdminPlugins || {};
PandaJS.AdminPluginBase = PandaJS.BaseClass.extend({
	data: [],
	init: function(client, logger){
		this.client = client;
		this.logger = logger;
	},
	/**
	 * Data received from client
	 * @param data
	 */
	onRecv: function(data){
		this.logger.log("recv:", data);
	},
	/**
	 * Injecting plugin into main app
	 * By default it injects the plugin in the extension menu
	 */
	inject: function(){
		var $li = $("<li></li>");
		$li.addClass("nav-item").append(
			$("<a href='javascript:;'></a>").addClass("nav-link")
			.append(
				$("<span></span>").attr("data-feather", this.getIcon())
			).append(
				this.getName()
			)
		);

		$li.on("click", function(){
			$(".nav-link", $(".pandajs-plugin-list")).removeClass("active");
			$(".nav-link", this).addClass("active");
		});

		$(".pandajs-plugin-list").append($li);
		return $li;
	},
	/**
	 * Name of the plugin, for auto injecting in the extension menu
	 */
	getName: function(){
		this.logger.error("getName is not defined!");
		throw new Error("getName is not defined!");
	},
	/**
	 * Feather icon of the plugin, for auto injecting in the extension menu
	 */
	getIcon: function(){
		return "codepen";
	},
	/**
	 * Executed on extension item click / when plugin is enabled
	 */
	onShow: function(){
		this.logger.error("onShow is not defined!");
		throw new Error("onShow is not defined!");
	},
	/**
	 * Executed when leaving this plugin / plugin is disabled
	 */
	onHide: function(){
		this.logger.error("onHide is not defined!");
		throw new Error("onHide is not defined!");
	},
	/**
	 * Executed when the Client has changed
	 */
	onReset: function(){
		this.logger.error("onReset is not defined!");
		throw new Error("onReset is not defined!");
	},
	/**
	 * Executed when a new session has started
	 */
	onNewSession: function(){
		this.onReset();
	}
});