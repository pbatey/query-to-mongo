var iso8601 = require('../lib/iso8601-regex')

describe("iso8601-regex", function () {
    it("should match YYYY", function () {
        expect(iso8601.test("2000")).toBe(true)
    })
    it("should match YYYY-MM", function () {
        expect(iso8601.test("2000-04")).toBe(true)
    })
    it("should match YYYY-MM-DD", function () {
        expect(iso8601.test("2000-04-01")).toBe(true)
    })
    it("should match YYYY-MM-DDThh:mmZ", function () {
        expect(iso8601.test("2000-04-01T12:00Z")).toBe(true)
        expect(iso8601.test("2000-04-01T12:00-08:00")).toBe(true)
        expect(iso8601.test("2000-04-01T12:00+01:00")).toBe(true)
    })
    it("should match YYYY-MM-DDThh:mm:ssZ", function () {
        expect(iso8601.test("2000-04-01T12:00:30Z")).toBe(true)
        expect(iso8601.test("2000-04-01T12:00:30-08:00")).toBe(true)
        expect(iso8601.test("2000-04-01T12:00:30+01:00")).toBe(true)
    })
    it("should match YYYY-MM-DDThh:mm:ss.sZ", function () {
        expect(iso8601.test("2000-04-01T12:00:30.250Z")).toBe(true)
        expect(iso8601.test("2000-04-01T12:00:30.250-08:00")).toBe(true)
        expect(iso8601.test("2000-04-01T12:00:30.250+01:00")).toBe(true)
    })
    it("should not match time without timezone", function () {
        expect(iso8601.test("2000-04-01T12:00")).toBe(false)
        expect(iso8601.test("2000-04-01T12:00:00")).toBe(false)
        expect(iso8601.test("2000-04-01T12:00:00.000")).toBe(false)
    })
    it("should not match out of range month", function () {
        expect(iso8601.test("2000-00")).toBe(false)
        expect(iso8601.test("2000-13")).toBe(false)
    })
    it("should not match out of range day", function () {
        expect(iso8601.test("2000-04-00")).toBe(false)
        expect(iso8601.test("2000-04-32")).toBe(false)
    })
    it("should not match out of range hour", function () {
        expect(iso8601.test("2000-04-01T24:00Z")).toBe(false)
    })
    it("should not match out of range minute", function () {
        expect(iso8601.test("2000-04-01T12:60Z")).toBe(false)
    })
    it("should not match out of range second", function () {
        expect(iso8601.test("2000-04-01T12:00:60Z")).toBe(false)
    })
    it("should not match time without timezone", function () {
        expect(iso8601.test("2000-04-01T12:00")).toBe(false)
        expect(iso8601.test("2000-04-01T12:00:00")).toBe(false)
        expect(iso8601.test("2000-04-01T12:00:00.000")).toBe(false)
    })
})
