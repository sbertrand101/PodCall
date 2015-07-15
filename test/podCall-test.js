"use strict";

var express = require("express");
var Router = require("../lib/Router");
var nock = require("nock");
var supertest = require("supertest");
var catapult = require("node-bandwidth");

//nock.recorder.rec();
var app = express();

describe("PodCall", function () {
	var router;
	it("should create a router using environment variables", function () {
		if (!process.env.CATAPULT_USER_ID) {
			process.env.CATAPULT_USER_ID = "fakeId";
		}
		if (!process.env.CATAPULT_API_TOKEN) {
			process.env.CATAPULT_API_TOKEN = "fakeToken";
		}
		if (!process.env.CATAPULT_API_SECRET) {
			process.env.CATAPULT_API_SECRET = "fakeSecret";
		}
		router = new Router();
	});
});

describe("PodCall", function () {
	var router;
	before(function () {
		router = new Router("fakeId", "fakeToken", "fakeSecret");
		app.use("/", router.router);
	});
	after(function () {
		nock.cleanAll();
	});
	describe("should answer an incoming call", function () {
		before(function () {
			nock("https://api.catapult.inetwork.com:443")
				.get("/v1/users/fakeId/calls/fakeId")
				.reply(500);
		});
		it("should handle errors when getting the call ID", function (done) {
			supertest(app)
				.post("/calls")
				.send({
					"callId" : "fakeId"
				})
				.expect(500)
				.end(done);
		});
		after(function () {
			nock.cleanAll();
		});
	});
	describe("should answer an incoming call", function () {
		before(function () {
			nock("https://api.catapult.inetwork.com:443")
				.get("/v1/users/fakeId/calls/fakeId")
				.reply(200);

			nock("https://api.catapult.inetwork.com:443")
				.post("/v1/users/fakeId/calls/undefined/audio", {
					"fileUrl" : "http://podcastdownload.npr.org/anon.npr-podcasts" +
					"/podcast/510208/422108689/npr_422108689.mp3?dl=1"
				})
				.reply(200);
		});
		it("should get the call ID and play audio", function (done) {
			supertest(app)
				.post("/calls")
				.send({
					"callId" : "fakeId"
				})
				.expect(200)
				.end(done);
		});
		after(function () {
			nock.cleanAll();
		});
	});
});
