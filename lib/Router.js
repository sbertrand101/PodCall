"use strict";

var catapult = require("node-bandwidth");
var express = require("express");
var bodyParser = require("body-parser");

var Router = function (id, token, secret) {
	//var applicationId = process.env.APPLICATION_ID;
	var userId = id || process.env.CATAPULT_USER_ID;
	var apiToken = token || process.env.CATAPULT_API_TOKEN;
	var apiSecret = secret || process.env.CATAPULT_API_SECRET;
	var client = new catapult.Client(userId, apiToken, apiSecret);
	var router = express.Router();

	router.use(bodyParser.json());
	router.post("/calls", function (req, res) {
		var callId = req.body.callId;
		catapult.Call.get(client, callId, function (err, call) {
			if (err) {
				res.sendStatus(500);
			}
			else {
				call.playAudio({ "fileUrl" : "http://podcastdownload.npr.org/anon.npr-podcasts" +
					"/podcast/510208/422108689/npr_422108689.mp3?dl=1" }, function () {});
				res.send();
			}
		});
	});
	this.router = router;
};

module.exports = Router;
