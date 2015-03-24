var assert = require("chai").assert
var q2m = require("../index")

describe("query-to-mongo(query).links =>", function () {
    describe("#links", function () {
        var links = q2m("offset=20&limit=10").links('http://localhost', 95)
        it("should create first link", function () {
            assert.equal(links.first, "http://localhost?offset=0&limit=10")
        })
        it("should create prev link", function () {
            assert.equal(links.prev, "http://localhost?offset=10&limit=10")
        })
        it("should create next link", function () {
            assert.equal(links.next, "http://localhost?offset=30&limit=10")
        })
        it("should create last link", function () {
            assert.equal(links.last, "http://localhost?offset=90&limit=10")
        })

        describe("with no pages", function () {
            var links = q2m("offset=0&limit=100").links('http://localhost', 95)
            it("should not create links", function () {
                assert.notOk(links.first)
                assert.notOk(links.last)
                assert.notOk(links.next)
                assert.notOk(links.prev)
            })
        })
        describe("when on first page", function () {
            var links = q2m("offset=0&limit=10").links('http://localhost', 95)
            it("should not create prev link", function () {
                assert.notOk(links.prev)
            })
            it("should not create first link", function () {
                assert.notOk(links.first)
            })
            it("should create next link", function () {
                assert.equal(links.next, "http://localhost?offset=10&limit=10")
            })
            it("should create last link", function () {
                assert.equal(links.last, "http://localhost?offset=90&limit=10")
            })
        })
        describe("when on last page", function () {
            var links = q2m("offset=90&limit=10").links('http://localhost', 95)
            it("should not create next link", function () {
                assert.notOk(links.next)
            })
            it("should not create last link", function () {
                assert.notOk(links.last)
            })
            it("should create prev link", function () {
                assert.equal(links.prev, "http://localhost?offset=80&limit=10")
            })
            it("should not create first link", function () {
                assert.equal(links.first, "http://localhost?offset=0&limit=10")
            })
        })
    })
})
