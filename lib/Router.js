"use strict";

var catapult = require("node-bandwidth");
var express = require("express");
var bodyParser = require("body-parser");
var pg = require("pg");
var config = require("./config");

var Router = function (id, token, secret) {
	var userId = id || process.env.CATAPULT_USER_ID;
	var apiToken = token || process.env.CATAPULT_API_TOKEN;
	var apiSecret = secret || process.env.CATAPULT_API_SECRET;
	var connectionString = process.env.DATABASE_URL;
	var client = new catapult.Client(userId, apiToken, apiSecret);
	var router = express.Router();

	router.use(bodyParser.json());
	router.use("/", express.static("public"));

	router.post("/calls", function (req, res) {
		if (req.body.eventType === "incomingcall") {
			var callId = req.body.callId;
			var podcastNum = req.body.to;
			var fileUrl;

			catapult.PhoneNumber.get(client, podcastNum, function (err, number) {
				if (err) {
					res.sendStatus(500);
				}
				else {
					fileUrl = number.name;
					catapult.Call.get(client, callId, function (err, call) {
						if (err) {
							res.sendStatus(500);
						}
						else {
							call.playAudio({ "fileUrl" : fileUrl }, function (err) {
								if (err) {
									call.hangUp(function () {
										res.sendStatus(500);
									});
								}
								else {
									res.send();
								}
							});
						}
					});
				}
			});
		}
		else if (req.body.eventType === "playback") {
			if (req.body.status === "done") {
				catapult.Call.get(client, req.body.callId, function (err, call) {
					call.hangUp(function () {
						res.send();
					});
				});
			}
			else {
				res.send();
			}
		}
		else {
			res.send();
		}
	});

	router.post("/signup", function (req, res) {
		pg.connect(connectionString, function (err, client, done) {
			if (err) {
				res.sendStatus(err);
			}
			else {
				client.query("INSERT INTO \"surveyResponses\" (email, referral, suggestion) " +
					"VALUES($1, $2, $3) RETURNING id",
					[ req.body.email, req.body.referral, req.body.suggestion ],
					function (err) {
						if (err) {
							res.sendStatus(err);
						}
						else {
							res.send(config.podcastNumbers);
						}
						done();
					});
			}
		});
	});

	this.router = router;
};

module.exports = Router;
