var assert = require("chai").assert
var iso8601 = require('../lib/iso8601-regex')

describe("iso8601-regex", function () {
    it("should match YYYY", function () {
        assert.ok(iso8601.test("2000"))
    })
    it("should match YYYY-MM", function () {
        assert.ok(iso8601.test("2000-04"))
    })
    it("should match YYYY-MM-DD", function () {
        assert.ok(iso8601.test("2000-04-01"))
    })
    it("should match YYYY-MM-DDThh:mmZ", function () {
        assert.ok(iso8601.test("2000-04-01T12:00Z"), 'Z')
        assert.ok(iso8601.test("2000-04-01T12:00-08:00"), '-08:00')
        assert.ok(iso8601.test("2000-04-01T12:00+01:00"), '+01:00')
    })
    it("should match YYYY-MM-DDThh:mm:ssZ", function () {
        assert.ok(iso8601.test("2000-04-01T12:00:30Z"), 'Z')
        assert.ok(iso8601.test("2000-04-01T12:00:30-08:00"), '-08:00')
        assert.ok(iso8601.test("2000-04-01T12:00:30+01:00"), '+01:00')
    })
    it("should match YYYY-MM-DDThh:mm:ss.sZ", function () {
        assert.ok(iso8601.test("2000-04-01T12:00:30.250Z"), 'Z')
        assert.ok(iso8601.test("2000-04-01T12:00:30.250-08:00"), '-08:00')
        assert.ok(iso8601.test("2000-04-01T12:00:30.250+01:00"), '+01:00')
    })
    it("should not match time without timezone", function () {
        assert.notOk(iso8601.test("2000-04-01T12:00"), 'hh:mm')
        assert.notOk(iso8601.test("2000-04-01T12:00:00"), 'hh:mm:ss')
        assert.notOk(iso8601.test("2000-04-01T12:00:00.000"), 'hh:mm:ss.s')
    })
    it("should not match out of range month", function () {
        assert.notOk(iso8601.test("2000-00"), '00')
        assert.notOk(iso8601.test("2000-13"), '13')
    })
    it("should not match out of range day", function () {
        assert.notOk(iso8601.test("2000-04-00"), '00')
        assert.notOk(iso8601.test("2000-04-32"), '32')
    })
    it("should not match out of range hour", function () {
        assert.notOk(iso8601.test("2000-04-01T24:00Z"))
    })
    it("should not match out of range minute", function () {
        assert.notOk(iso8601.test("2000-04-01T12:60Z"))
    })
    it("should not match out of range second", function () {
        assert.notOk(iso8601.test("2000-04-01T12:00:60Z"))
    })
    it("should not match time without timezone", function () {
        assert.notOk(iso8601.test("2000-04-01T12:00"), 'hh:mm')
        assert.notOk(iso8601.test("2000-04-01T12:00:00"), 'hh:mm:ss')
        assert.notOk(iso8601.test("2000-04-01T12:00:00.000"), 'hh:mm:ss.s')
    })
})
