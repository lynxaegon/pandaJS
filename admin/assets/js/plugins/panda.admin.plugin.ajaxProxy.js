/**
 * Ajax proxy admin interface
 */
PandaJS.AdminPlugins.AjaxProxy = PandaJS.AdminPluginBase.extend({
	_items: {},
	_autoIncrement: 0,
	readyState: [
		"UNSENT",
		"OPENED",
		"HEADERS_RECEIVED",
		"LOADING",
		"DONE"
	],
	onRecv: function(data){
		this.logger.log("recv:", data);

		if(!this._scrollableContainer)
			this._scrollableContainer = $(".plugin-ajax-proxy-scrollable");

		var $el;
		_.each(data, function(item){
			this._items[item.id] = {
				$element: false,
				item: item
			};
			$el = this.createOrUpdateItem(item);
			if($el) {
				this._items[item.id].$element = $el;
				this.$list.append(this._items[item.id].$element);
			}

			this._scrollableContainer[0].scrollTop = this._scrollableContainer[0].scrollHeight;
		}, this);
	},
	getName: function(){
		return "Ajax Requests";
	},
	getIcon: function(){
		return false;
	},
	inject: function(){
		return false;
	},
	onShow: function(){
		var $table = $("<table></table>").addClass("table-responsive table table-sm w-100 d-block d-md-table");
		$table.append(
			$("<thead></thead>").append(
				$("<tr></tr>").append(
					$("<th>#</th>")
				).append(
					$("<th>URL</th>")
				).append(
					$("<th>State</th>")
				).append(
					$("<th>Status</th>")
				).append(
					$("<th style='text-align:right;'>Duration</th>")
				)
			)
		);

		if(!this.list){
			this.$list = $("<tbody></tbody>");
		}

		$table.append(this.$list);
		return $table;
	},
	onHide: function(){

	},
	onReset: function(){
		this._autoIncrement = 0;
		this._items = {};
		this.$list.empty();
	},
	createOrUpdateItem: function(item){
		var $tr = $("[data-panda-id='"+item.id+"']", this.$list);
		var incrementId = $(".index", $tr).text();
		if( $tr.length == 0){
			this._autoIncrement++;
			incrementId = this._autoIncrement;
			$tr = $("<tr></tr>");
		}
		$tr.empty();
		$tr.attr("data-panda-id", item.id);

		var index = item.url.indexOf("?");
		item.url = item.url.slice(0, index == -1 ? item.url.length : index);

		$tr.append(
			$("<th scope='row' class='index'>" + incrementId + "</th>")
		).append(
			$("<td class='url'>" + item.url + "</td>")
		).append(
			$("<td class='readyState' style='text-align:left;'>" + this.readyState[item.readyState] + "</td>")
		).append(
			$("<td class='state' style='text-align:left;'>" + item.status + "</td>")
		).append(
			$("<td class='duration' style='text-align:right;'>" + item.duration + " ms</td>")
		);

		$tr
			.removeClass("alert-success")
			.removeClass("alert-danger")
			.removeClass("alert-warning")
			.addClass(
				(item.readyState == 4) ? (
					item.status == 200 ? "alert-success" : "alert-danger"
				) : "alert-warning"
			);

		return $tr;
	}
});