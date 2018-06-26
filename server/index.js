const argv = process.argv.slice(2);
const PORT = parseInt(argv[0]) || 8081;
const DEBUG = argv[1] ? true : false;

var path = require("path");
var fs = require("fs");
var _ = require('underscore');

var MasterModel = require("./libs/models/masterModel");
var MasterList = new (require("./libs/models/masterList"))();
var ClientModel = require("./libs/models/clientModel");
var ClientList = new (require("./libs/models/clientList"))();

MasterList.on("change", function(data){
	ClientList.publish({
		plugin: "ClientList",
		data: data
	});
});


var server = require('http').createServer(handler);
const io = require('socket.io')(server, {
	pingInterval: 10000,
	pingTimeout: 5000
});

io.on('connection', function(socket){

	/** Master Events **/
	//region Master Events
	socket.on("/master/setup", function(data){
		socket.masterModel = new MasterModel(data, socket);
		MasterList.add(socket.masterModel);
	});
	socket.on("/master/update", function(data) {
		MasterList.update(socket.masterModel, data);
	});
	socket.on("/master/data", function(data){
		socket.masterModel.onData(data);
	});
	//endregion

	/** Client Events **/
	//region Client Events
	socket.on("/client/setup", function(data){
		socket.clientModel = new ClientModel(data.guid, socket);
		ClientList.add(socket.clientModel);
	});
	socket.on("/client/attachTo", function(data){
		if(socket.clientModel) {
			var master = MasterList.find(data.guid);
			if(master){
				socket.clientModel.attachTo(master);
			} else {
				socket.clientModel.deattach();
			}
		}
	});
	socket.on("/client/deattach", function(){
		if(socket.clientModel) {
			socket.clientModel.deattach();
		}
	});
	socket.on("/client/data", function(data){
		if(socket.clientModel) {
			socket.clientModel.send(data);
		}
	});
	//endregion

	/** Server Events **/
	//region Server Events
	socket.on("/server/client_list", function(){
		if(socket.clientModel) {
			socket.clientModel.onRecv({
				plugin: "ClientList",
				data: MasterList.getAll()
			});
		}
	});
	//endregion

	/** Misc Events **/
	//region Misc Events
	socket.on('disconnect', function(){
		if(socket.masterModel){
			MasterList.remove(socket.masterModel);
		}
		if(socket.clientModel){
			ClientList.remove(socket.clientModel);
		}
	});
	//endregion
});
server.listen(PORT);

function handler (req, res) {
	var root = __dirname + '/../admin';
	req.url = path.normalize(req.url);
	if(req.url == "/")
		req.url = "/index.html";

	fs.readFile(root + req.url,
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end();
			}

			res.writeHead(200);
			res.end(data);
		});
}

console.log("Started on port", PORT);

if(DEBUG) {
	setInterval(function () {
		var clientsCount = MasterList.find("test_guid");
		clientsCount = clientsCount ? clientsCount.clients.length : 0;
		var logsCount = MasterList.find("test_guid");
		logsCount = logsCount ? logsCount.logs.length : 0;
		console.log(
			"Active Masters:", MasterList.activeList.length,
			"Inactive Masters:", MasterList.deleteList.length,
			"Active Clients:", ClientList.list.length,
			"Master Clients:", clientsCount,
			"Master Logs:", logsCount
		);
	}, 10000);
}