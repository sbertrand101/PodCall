"use strict";

var catapult = require("node-bandwidth");
var express = require("express");
var bodyParser = require("body-parser");
var pg = require("pg");

var Router = function (id, token, secret) {
	var userId = id || process.env.CATAPULT_USER_ID;
	var apiToken = token || process.env.CATAPULT_API_TOKEN;
	var apiSecret = secret || process.env.CATAPULT_API_SECRET;
	var connectionString = process.env.DATABASE_URL;
	var client = new catapult.Client(userId, apiToken, apiSecret);
	var router = express.Router();
	var self = this;

	//podcast Numbers
	var thisAmericanLifeNum = process.env.THIS_AMERICAN_LIFE;
	var planetMoneyNum = process.env.PLANET_MONEY;
	var tedRadioNum = process.env.TED_NUM;
	var serialNum = process.env.SERIAL_NUM;
	var carTalkNum = process.env.CAR_TALK_NUM;
	var gimletNum = process.env.GIMLET_NUM;
	var radioLabNum = process.env.RADIO_LAB_NUM;
	var wtfNum = process.env.WTF_NUM;
	var bsReportNum = process.env.BS_REPORT_NUM;
	var securityNowNum = process.env.SECURITY_NUM;

	router.use(bodyParser.json());
	router.use("/", express.static("public"));

	//podcast URLs
	//Could have an error line for the case when there is an err
	var thisAmericanLife;
	catapult.PhoneNumber.get(client, thisAmericanLifeNum, function (err, number) {
		thisAmericanLife = number.name;
	});
	var planetMoney;
	catapult.PhoneNumber.get(client, planetMoneyNum, function (err, number) {
		planetMoney = number.name;
	});
	var tedRadio;
	catapult.PhoneNumber.get(client, tedRadioNum, function (err, number) {
		tedRadio = number.name;
	});
	var serial;
	catapult.PhoneNumber.get(client, serialNum, function (err, number) {
		serial = number.name;
	});
	var carTalk;
	catapult.PhoneNumber.get(client, carTalkNum, function (err, number) {
		carTalk = number.name;
	});
	var gimlet;
	catapult.PhoneNumber.get(client, gimletNum, function (err, number) {
		gimlet = number.name;
	});
	var radioLab;
	catapult.PhoneNumber.get(client, radioLabNum, function (err, number) {
		radioLab = number.name;
	});
	var wtfPodcast;
	catapult.PhoneNumber.get(client, wtfNum, function (err, number) {
		wtfPodcast = number.name;
	});
	var bsReport;
	catapult.PhoneNumber.get(client, bsReportNum, function (err, number) {
		bsReport = number.name;
	});
	var securityNow;
	catapult.PhoneNumber.get(client, securityNowNum, function (err, number) {
		securityNow = number.name;
	});

	this.handleDtmf = function (req, res) {
		var callId = req.body.callId;
		var digit = req.body.dtmfDigit;
		catapult.Call.get(client, callId, function (err, call) {
			if (err) {
				res.sendStatus(500);
			}
			else {
				var podcastNum = call.to;
				var fileUrl = (podcastNum === thisAmericanLifeNum) ? thisAmericanLife :
											(podcastNum === planetMoneyNum) ? planetMoney :
											(podcastNum === tedRadioNum) ? tedRadio :
											(podcastNum === serialNum) ? serial :
											(podcastNum === carTalkNum) ? carTalk :
											(podcastNum === radioLabNum) ? radioLab :
											(podcastNum === wtfNum) ? wtfPodcast :
											(podcastNum === bsReportNum) ? bsReport :
											(podcastNum === securityNowNum) ? securityNow :
											(podcastNum === gimletNum) ? gimlet : null;
				if (digit === "1") {
					//do something to slice audio file
					call.playAudio({ "fileUrl" : "" }, function () {});
				}
				else if (digit === "2") {
					//do something to play the sliced audio file
					call.playAudio({ "fileUrl" : fileUrl }, function () {});
				}
				else if (digit === "3") {
					call.playAudio({ "fileUrl" : fileUrl }, function () {});
				}
				res.send();
			}
		});
	};

	router.post("/calls", function (req, res) {
		if (req.body.eventType === "incomingcall") {
			var callId = req.body.callId;
			var podcastNum = req.body.to;
			var fileUrl = (podcastNum === thisAmericanLifeNum) ? thisAmericanLife :
										(podcastNum === planetMoneyNum) ? planetMoney :
										(podcastNum === tedRadioNum) ? tedRadio :
										(podcastNum === serialNum) ? serial :
										(podcastNum === carTalkNum) ? carTalk :
										(podcastNum === radioLabNum) ? radioLab :
										(podcastNum === wtfNum) ? wtfPodcast :
										(podcastNum === bsReportNum) ? bsReport :
										(podcastNum === securityNowNum) ? securityNow :
										(podcastNum === gimletNum) ? gimlet : null;

			catapult.Call.get(client, callId, function (err, call) {
				if (err) {
					res.sendStatus(500);
				}
				else {
					call.playAudio({ "fileUrl" : fileUrl }, function () {});
					res.send();
				}
			});
		}
		else if (req.body.eventType === "dtmf") {
			self.handleDtmf(req, res);
		}
		else if (req.body.eventType === "playback") {
			if (req.body.status === "done") {
				catapult.Call.get(client, req.body.callId, function (err, call) {
					call.hangUp(function () {});
				});
			}
		}
		else {
			res.send();
		}
	});

	router.post("/signup", function (req, res) {
		if (req.body.email && req.body.referral && req.body.suggestion) {
			var client = new pg.Client({
				user     : process.env.DATABASE_USER,
				password : process.env.DATABASE_PASSWORD,
				database : process.env.DATABASE,
				port     : process.env.DATABASE_PORT,
				host     : process.env.DATABASE_HOST,
				ssl      : true
			});
			client.connect();
			pg.connect(connectionString, function () {
				client.query("INSERT INTO \"surveyResponses\" (email, referral, suggestion) " +
					"VALUES($1, $2, $3) RETURNING id",
					[ req.body.email, req.body.referral, req.body.suggestion ],
					function (err, result) {
						if (err) {
							console.log(err);
						}
						else {
							console.log("row inserted with id: " + result.rows[0].id);
						}
						client.end();
					});
			});
			res.send();
		}
		else {
			res.sendStatus(400);
		}
	});

	this.router = router;
};

module.exports = Router;
