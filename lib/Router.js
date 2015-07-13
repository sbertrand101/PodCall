"use strict";

var catapult = require("node-bandwidth");
var express = require("express");

var Router = function () {
	//var applicationId = process.env.APPLICATION_ID;
	var userId = process.env.CATAPULT_USER_ID;
	var apiToken = process.env.CATAPULT_API_TOKEN;
	var apiSecret = process.env.CATAPULT_API_SECRET;
	var client = new catapult.Client(userId, apiToken, apiSecret);
	var router = express.Router();

	router.post("/calls", function (req, res) {
		var callId = req.body.callId;
		catapult.Call.get(client, callId, function (err, call) {
			call.playAudio({ "fileUrl" : "http://podcastdownload.npr.org/anon.npr-podcasts" +
			"/podcast/510208/422108689/npr_422108689.mp3?dl=1" }, function () {});
		});
		res.send();
	});
	this.router = router;
};

module.exports = Router;
