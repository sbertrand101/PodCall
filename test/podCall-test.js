"use strict";

var express = require("express");
var Router = require("../lib/Router");
var nock = require("nock");
var supertest = require("supertest");
var catapult = require("node-bandwidth");
var sinon = require("sinon");
var pg = require("pg");

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
		if (!process.env.DATABASE) {
			process.env.DATABASE = "database";
		}
		if (!process.env.DATABASE_HOST) {
			process.env.DATABASE_HOST = "host";
		}
		if (!process.env.DATABASE_USER) {
			process.env.DATABASE_USER = "user";
		}
		if (!process.env.DATABASE_PASSWORD) {
			process.env.DATABASE_PASSWORD = "password";
		}
		if (!process.env.DATABASE_PORT) {
			process.env.DATABASE_PORT = "port";
		}
		if (!process.env.DATABASE_URL) {
			process.env.DATABASE_URL = "fakeUrl";
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
				.get("/v1/users/fakeId/phoneNumbers/someNumber")
				.reply(500);
			nock("https://api.catapult.inetwork.com:443")
				.get("/v1/users/fakeId/calls/fakeId")
				.reply(500);
		});
		it("should handle errors when getting the call ID", function (done) {
			supertest(app)
				.post("/calls")
				.send({
					"callId"    : "fakeId",
					"eventType" : "incomingcall",
					"to"        : "someNumber"
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
				.post("/v1/users/fakeId/phoneNumbers/someNumber",
					{ "eventType" : "incomingcall",
						"to"         : "someNumber",
						"callId"     : "fakeId"
					})
				.reply(200,
					{
						"name" : "fakeUrl"
					});

			nock("https://api.catapult.inetwork.com:443")
				.get("/v1/users/fakeId/phoneNumbers/someNumber")
				.reply(200);

			nock("https://api.catapult.inetwork.com:443")
				.post("/v1/users/fakeId/calls/undefined/audio", {})
				.reply(200);
		});
		it("should get the call ID and play audio", function (done) {
			supertest(app)
				.post("/calls")
				.send({
					"eventType" : "incomingcall",
					"to"        : "someNumber",
					"callId"    : "fakeId"
				})
				.expect(200)
				.end(done);
		});
		after(function () {
			nock.cleanAll();
		});
	});
	describe("Should handle non-incoming-call events", function () {
		before(function () {
			nock("https://api.catapult.inetwork.com:443")
				.get("/v1/users/fakeId/calls/fakeId")
				.reply(200);
			nock("https://api.catapult.inetwork.com:443")
				.get("/v1/users/fakeId/calls/undefined")
				.reply(200);
			nock("https://api.catapult.inetwork.com:443")
				.post("/v1/users/fakeId/calls/undefined",
					{ "state" : "completed" })
				.reply(200);
		});
		it("should hang up at the end of the podcast on playback event", function (done) {
			supertest(app)
				.post("/calls")
				.send({
					"eventType" : "playback",
					"status"    : "done",
					"callId"    : "fakeId"
				})
				.expect(200)
				.end(done);
		});
		it("should do nothing on other playback events", function (done) {
			supertest(app)
				.post("/calls")
				.send({
					"eventType" : "playback",
					"status"    : "started",
					"callId"    : "fakeId"
				})
				.expect(200)
				.end(done);
		});
		it("should do nothing on all other events", function (done) {
			supertest(app)
				.post("/calls")
				.send({
					"eventType" : "dtmf",
					"callId"    : "fakeId"
				})
				.expect(200)
				.end(done);
		});
		after(function () {
			nock.cleanAll();
		});
	});
	describe("should handle posts to /signup", function () {
		var stub;
		before(function () {
			nock("http://127.0.0.1:64997")
				.post("/signup",
					{ "email"     : "test@test.com",
						"referral"   : "someone",
						"suggestion" : "something" })
				.reply(200, [ "(716) 259-1901","(828) 552-4457","(321) 270-7744","(521) 434-0404",
				"(602) 730-9977","(415) 423-0082","(910) 408-5968","(347) 474-9604","(615) 682-8055" ],
				{ "x-powered-by"  : "Express",
					"content-type"   : "application/json; charset=utf-8",
					"content-length" : "154",
					etag             : "W/\"9a-Xsc3P9sQD0qX2V2aKIIaNA\"",
					date             : "Tue, 28 Jul 2015 19:32:44 GMT",
					connection       : "close" });

			var fakeClient = {
				query : function (config, values, callback) {
					var result = {
						"rows" : [ { id : 1 } ]
					};
					callback(null, result);
				}
			};

			stub = sinon.stub(pg, "connect", function (connectionString, callback) {
				callback(null, fakeClient, function () {});
			});
		});
		it("should post to /signup", function (done) {
			supertest(app)
				.post("/signup")
				.send({
					"email"      : "test@test.com",
					"referral"   : "someone",
					"suggestion" : "something"
				})
				.expect(200)
				.end(done);
		});
		it("should handle invalid posts to /signup", function (done) {
			supertest(app)
				.post("/signup")
				.send({
					"email" : "test@test.com"
				})
				.expect(400)
				.end(done);
		});
		after(function () {
			nock.cleanAll();
			pg.connect.restore();
		});
	});
	describe("should handle connection errors on posts to /signup", function () {
		var stub;
		before(function () {
			var fakeClient = {
				query : function (config, values, callback) {
					var result = {
						"rows" : [ { id : 1 } ]
					};
					callback(null, result);
				}
			};

			stub = sinon.stub(pg, "connect", function (connectionString, callback) {
				callback(500, fakeClient, function () {});
			});
		});
		it("should handle a connection error", function (done) {
			supertest(app)
				.post("/signup")
				.send({
					"email"      : "test@test.com",
					"referral"   : "someone",
					"suggestion" : "something"
				})
				.expect(500)
				.end(done);
		});
		after(function () {
			pg.connect.restore();
		});
	});
	describe("should handle database errors on posts to /signup", function () {
		var stub;
		before(function () {
			var fakeClient = {
				query : function (config, values, callback) {
					var result = {
						"rows" : [ { id : 1 } ]
					};
					callback(500);
				}
			};

			stub = sinon.stub(pg, "connect", function (connectionString, callback) {
				callback(null, fakeClient, function () {});
			});
		});
		it("should handle a database error", function (done) {
			supertest(app)
				.post("/signup")
				.send({
					"email"      : "test@test.com",
					"referral"   : "someone",
					"suggestion" : "something"
				})
				.expect(500)
				.end(done);
		});
		after(function () {
			pg.connect.restore();
		});
	});
});
