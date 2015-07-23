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
	var self = this;

	//podcast URLs
	var thisAmericanLife = "http://www.podtrac.com/pts/redirect.mp3/podcast.thisamericanlife.org/podcast/561.mp3";
	var planetMoney = "http://pd.npr.org/anon.npr-mp3/npr/blog/2015/07/20150717_blog_pmpod.mp3?dl=1";
	var tedRadio = "http://pd.npr.org/anon.npr-mp3/npr/ted/2015/07/20150717_ted_01.mp3?dl=1";
	var serial = "http://dts.podtrac.com/redirect.mp3/files.serialpodcast.org/" +
		"sites/default/files/podcast/1433448038/serial-s01-e01.mp3";
	var carTalk = "http://podcastdownload.npr.org/anon.npr-podcasts/podcast/510208/424149893/npr_424149893.mp3?dl=1";
	var gimlet = "http://www.podtrac.com/pts/redirect.mp3/feeds.soundcloud.com/" +
		"stream/214926459-replyall-32-the-evilest-technology-on-earth-1.mp3";
	var radioLab = "http://www.podtrac.com/pts/redirect.mp3/audio4.wnyc.org/radiolab/radiolab112108.mp3";
	var wtfPodcast = "http://traffic.libsyn.com/wtfpod/WTF_-_EPISODE_621_IAN_MCKELLAN.mp3";
	var bsReport = "http://c.espnradio.com/s:5L8r1/audio/2491909/bsreport_2015-05-08-112609.64k.mp3?" +
		"ad_params=zones%3DPreroll%2CPreroll2%2CMidroll%2CMidroll2%2CMidroll3%2CMidroll4%2CMidroll5" +
		"%2CMidroll6%2CPostroll%2CPostroll2%7Cstation_id%3D598";

	router.use(bodyParser.json());
	router.use("/", express.static("public"));

	this.handleDtmf = function (req, res) {
		var callId = req.body.callId;
		var digit = req.body.dtmfDigit;
		catapult.Call.get(client, callId, function (err, call) {
			if (err) {
				res.sendStatus(500);
			}
			else {
				var podcastNum = call.to;
				var fileUrl = (podcastNum === "+18285524457") ? thisAmericanLife :
											(podcastNum === "+13212707744") ? planetMoney :
											(podcastNum === "+15124340404") ? tedRadio :
											(podcastNum === "+14154230082") ? serial :
											(podcastNum === "+19104085968") ? carTalk :
											(podcastNum === "+16027309977") ? radioLab :
											(podcastNum === "+13474749604") ? wtfPodcast :
											(podcastNum === "+16156828055") ? bsReport :
											(podcastNum === "+17162591901") ? gimlet : null;
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
			var fileUrl = (podcastNum === "+18285524457") ? thisAmericanLife :
										(podcastNum === "+13212707744") ? planetMoney :
										(podcastNum === "+15124340404") ? tedRadio :
										(podcastNum === "+14154230082") ? serial :
										(podcastNum === "+19104085968") ? carTalk :
										(podcastNum === "+16027309977") ? radioLab :
										(podcastNum === "+13474749604") ? wtfPodcast :
										(podcastNum === "+16156828055") ? bsReport :
										(podcastNum === "+17162591901") ? gimlet : null;

			catapult.Call.get(client, callId, function (err, call) {
				if (err) {
					res.sendStatus(500);
				}
				else {
					//call.playAudio({ "sentence" : "Press 1 to pause, 2 to play, 3 to restart" }, function () {});
					call.playAudio({ "fileUrl" : fileUrl }, function () {});
					res.send();
				}
			});
		}
		else if (req.body.eventType === "dtmf") {
			self.handleDtmf(req, res);
		}
		else {
			res.send();
		}
	});

	router.post("/signup", function (req, res) {
		res.send();
	});

	this.router = router;
};

module.exports = Router;
