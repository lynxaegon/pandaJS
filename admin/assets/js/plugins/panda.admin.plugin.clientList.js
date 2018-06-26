/**
 * Show the client list
 */
PandaJS.AdminPlugins.ClientList = PandaJS.AdminPluginBase.extend({
	init: function(){
		this._super.apply(this, arguments);
		this._activeClient = false;
	},
	onRecv: function(data){
		this.logger.log(data);
		this.$list.empty();

		var $item;
		_.each(data.active, function(item){
			$item = this.createItem(item, true);
			if(item.guid == this._activeClient)
				$item.click();
			this.$list.append($item);
		}, this);
		_.each(data.inactive, function(item){
			$item = this.createItem(item, false);
			if(item.guid == this._activeClient)
				$item.click();
			this.$list.append($item);
		}, this);

		this.updateItems();

		feather.replace();
	},
	getName: function(){
		return "Clients";
	},
	getIcon: function(){
		return "users";
	},
	inject: function(){
		var $header = $("<h6></h6>");
		$header.addClass("sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted");
		$header.append(
			$("<span></span>").text(this.getName())
		);
		$header.append(
			$("<a></a>").addClass("d-flex align-items-center text-muted")
				.append(
					$("<span></span>").attr("data-feather", this.getIcon())
				)
		);
		this.$list = $("<ul></ul>");
		this.$list.addClass("nav flex-column mb-2 pandajs-client-list");


		$(".sidebar-sticky").append($header);
		$(".sidebar-sticky").append(this.$list);

		this.client.sendRaw("/server/client_list");

		this.onShow();
	},
	createItem: function(data, isActive){
		var self = this;
		var $item = $("<li></li>");
		$item.addClass("nav-item");

		$item.append(
			$("<a href='javascript:;'></a>")
				.addClass("nav-link")
				.attr("data-is_active", isActive)
				.append(
					$("<span></span>").attr("data-feather", isActive ? "monitor" : "wifi-off")
				).append(
					$("<span></span>").text(data.guid)
				).append(
					$("<span class='last_active'></span>").attr("data-last_active", data.lastActive)
				)
		).attr("data-panda-guid", data.guid);

		$item.on("click", function(){
			if($(".nav-link", this).hasClass("active"))
				return false;

			var activeClient = $(this).attr("data-panda-guid");
			self.client.sendRaw("/client/attachTo", {
				guid: $(this).attr("data-panda-guid")
			});

			if(self._activeClient !== activeClient) {
				self._activeClient = activeClient;
				_.each(self.client.plugins, function (plugin) {
					plugin.onReset();
				});
			}

			$(".nav-link", self.$list).removeClass("active");
			$(".nav-link", this).addClass("active");
		});

		return $item;
	},
	updateItems: function(){
		if(this.$list){
			var value = 0;
			var isActive;
			$(".nav-link", this.$list).each(function(){
				isActive = $(this).attr("data-is_active") == "true" ? true : false;

				value = $(".last_active", $(this)).attr("data-last_active");
				value = Math.floor(((+new Date()) - value) / 1000);

				if(!isActive){
					var min = Math.floor(value / 60);
					var sec = value % 60;

					var text;
					if(min > 0){
						text = min + "m";
					} else {
						text = sec + "s";
					}
					$(".last_active", $(this)).text(" (" + text + ")");
				}
			});
		}
	},
	onReset: function(){
		// do nothing
	},
	onHide: function(){
		clearInterval(this._updateTimer);
	},
	onShow: function(){
		var self = this;
		this._updateTimer = setInterval(function(){
			self.updateItems();
		}, 1000);
	}
});