var assert = require("chai").assert
var q2m = require("../index")

describe("query-to-mongodb(query) =>", function () {
    describe(".criteria", function () {
        it("should create criteria", function () {
            var results = q2m("field=value")
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {field: "value"})
        })
        it("should create numeric criteria", function () {
            var results = q2m("i=10&f=1.2")
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {"i": 10, "f": 1.2})
        })
        it("should create boolean criteria", function () {
            var results = q2m("t=true&f=false")
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {t: true, f: false})
        })
        it("should create $gt criteria", function () {
            var results = q2m("field>value")
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {field: {"$gt": "value"}})
        })
        it("should create $lt criteria", function () {
            var results = q2m("field<value")
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {field: {"$lt": "value"}})
        })
        it("should create $gte criteria", function () {
            var results = q2m("field>=value")
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {field: {"$gte": "value"}})
        })
        it("should create $lte criteria", function () {
            var results = q2m("field<=value")
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {field: {"$lte": "value"}})
        })
        it("should create $ne criteria", function () {
            var results = q2m("field!=value")
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {field: {"$ne": "value"}})
        })
        it("should create $in criteria", function () {
            var results = q2m("field=a&field=b")
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {field: {"$in": ["a","b"]}})
        })
        it("should create $nin criteria", function () {
            var results = q2m("field!=a&field!=b")
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {field: {"$nin": ["a","b"]}})
        })
        it("should ignore criteria", function () {
            var results = q2m("field=value&envelope=true", { ignore: ['envelope']})
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {field: "value"})
        })
    })

    describe(".options", function () {
        it("should create paging options", function () {
            var results = q2m("offset=8&limit=16")
            assert.ok(results.options)
            assert.deepEqual(results.options, {skip: 8, limit: 16})
        })
        it("should create field option", function () {
            var results = q2m("fields=a,b,c")
            assert.ok(results.options)
            assert.deepEqual(results.options, {fields: {a:true, b:true, c:true}})
        })
        it("should create sort option", function () {
            var results = q2m("sort=a,+b,-c")
            assert.ok(results.options)
            assert.deepEqual(results.options, {sort: {a:1, b:1, c:-1}})
        })
        it("should limit queries", function () {
            var results = q2m("limit=100", {maxLimit: 50})
            assert.ok(results.options)
            assert.deepEqual(results.options, {limit: 50})
        })
    })
})
