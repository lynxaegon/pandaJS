/**
 * Ajax proxy admin interface
 */
PandaJS.AdminPlugins.ConsoleProxy = PandaJS.AdminPluginBase.extend({
	init: function(){
		this._super.apply(this, arguments);
		this._history = {
			list: [],
			keepLast: 100,
			index: -1,
			push: function(command){
				var exists = this.list.indexOf(command);
				if(exists !== -1){
					this.list.splice(exists, 1);
				}
				this.list.unshift(command);
				this.list = this.list.slice(0, this.keepLast);
				this.reset();
			},
			up: function(){
				this.index++;
				if(this.index >= this.list.length)
					this.index = 0;

				return this.list[this.index];
			},
			down: function(){
				this.index--;
				if(this.index < 0)
					this.index = this.list.length - 1;

				return this.list[this.index];
			},
			reset: function(){
				this.index = -1;
			},
			clear: function(){
				this.reset();
				this.list = [];
			}
		};

	},
	onRecv: function(data){
		this.logger.log("recv:", data);

		this.$console.append(this.createItem(data));
		feather.replace();
		this.$console[0].scrollTop = this.$console[0].scrollHeight;

		this._isFirst = false;
	},
	getName: function(){
		return "Console Logs";
	},
	getIcon: function(){
		return false;
	},
	inject: function(){
		return false;
	},
	onShow: function(){
		var self = this;
		if(!self.$input){
			self.$input = $("<input type='text'>").addClass("form-control");
			self.$input.on("keypress", function (e) {
				if (e.which == 13) {
					var command = $(this).val();
					$(this).val("");
					self._history.push(command);

					self.client.sendRaw("/client/data", {
						plugin: "CommandExecutor",
						data: command
					});
					return false;
				}
			});
			self.$input.on("keydown", function (e) {
				if(e.which == 9){
					return false;
				} else if(e.which == 38){
					self.$input.val(self._history.up());

				} else if(e.which == 40){
					self.$input.val(self._history.down());
				}
			})
		}
		if(!self.$console){
			self.$console = $("<div style='height: calc(100% - 40px);overflow-y: scroll;margin-bottom: 8px;'></div>");
		}

		return [self.$console, self.$input];
	},
	onHide: function(){

	},
	onReset: function(){
		this.$console.empty();
		this._isFirst = true;
		this._history.clear();
	},
	createItem: function(item){
		var $div = $("<div></div>").addClass("item");

		var color = "alert-none";
		switch (item.type) {
			case "log":
			case "info":
				break;
			case "error":
				color = "alert-danger";
				break;
			case "warn":
			case "debug":
				color = "alert-warning";
				break;
		}

		if(!this._isFirst) {
			$div.append(
				$("<hr class='small'/>")
			);
		}

		if (item.type !== "eval") {
			$div.addClass(color);
			var $tmp = $("<span class='pretty'></span>");
			_.each(item.args, function(i){
				$tmp.append((new JSONFormatter(i, 0)).render());
			});
			$tmp.append($("<div class='clear'></div>"));
			$div.append($tmp);
		} else {
			if(item.args[0] == "command") {
				$div.addClass("command").append(
					$('<i data-feather="chevron-right"></i>')
				).append(
					$("<span class='normal'></span>").text(item.args[1])
				);
			} else if(item.args[0] == "eval") {
				$div.addClass("eval").append(
					$('<i data-feather="chevron-left"></i>')
				).append(
					$("<span class='pretty'></span>").html((new JSONFormatter(item.args[1], 0)).render())
				).append($("<div class='clear'></div>"));
			}
		}

		return $div;
	}
});