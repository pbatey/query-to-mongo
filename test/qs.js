var assert = require("chai").assert
var q2m = require("../index")
var qs = require("qs")

describe("qs.parse =>", function () {
    describe(".criteria", function () {
        it("should create criteria", function () {
            var results = q2m(qs.parse("field=value"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {field: "value"})
        })
        it("should create nested criteria", function () {
            var results = q2m(qs.parse("foo[bar]=value"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {bar: "value"}})
        })
        it("should create deep criteria", function () {
            var results = q2m(qs.parse("a[b][c][d][e][f]=value"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {a: {b: {c: {d: {e: {f: "value"}}}}}})
        })
        it("should create numeric criteria", function () {
            var results = q2m(qs.parse("foo[i]=10&foo[f]=1.2"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {"i": 10, "f": 1.2}})
        })
        it("should create boolean criteria", function () {
            var results = q2m(qs.parse("foo[t]=true&foo[f]=false"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {t: true, f: false}})
        })
/*
        it("should create $gt criteria", function () {
            var results = q2m(qs.parse("foo[bar]>value"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {bar: {"$gt": "value"}}})
        })
        it("should create $lt criteria", function () {
            var results = q2m(qs.parse("foo[bar]<value"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {bar: {"$lt": "value"}}})
        })
        it("should create $gte criteria", function () {
            var results = q2m(qs.parse("foo[bar]>=value"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {bar: {"$gte": "value"}}})
        })
        it("should create $lte criteria", function () {
            var results = q2m(qs.parse("foo[bar]<=value"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {bar: {"$lte": "value"}}})
        })
        it("should create $ne criteria", function () {
            var results = q2m(qs.parse("foo[bar]!=value"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {bar: {"$ne": "value"}}})
        })
        it("should create $in criteria", function () {
            var results = q2m(qs.parse("foo[bar]=a&field=b"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {bar: {"$in": ["a","b"]}}})
        })
        it("should create $nin criteria", function () {
            var results = q2m(qs.parse("foo[bar]!=a&field!=b"))
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {bar: {"$nin": ["a","b"]}}})
        })
*/
        it("should ignore criteria", function () {
            var results = q2m(qs.parse("foo[bar]=value&bar[foo]=true"), { ignore: ['bar']})
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {bar: "value"}})
        })
    })

    describe(".options", function () {
        it("should create paging options", function () {
            var results = q2m(qs.parse("offset=8&limit=16"))
            assert.ok(results.options)
            assert.deepEqual(results.options, {skip: 8, limit: 16})
        })
        it("should create field option", function () {
            var results = q2m(qs.parse("fields=a,b,c"))
            assert.ok(results.options)
            assert.deepEqual(results.options, {fields: {a:true, b:true, c:true}})
        })
        it("should create sort option", function () {
            var results = q2m(qs.parse("sort=a,+b,-c"))
            assert.ok(results.options)
            assert.deepEqual(results.options, {sort: {a:1, b:1, c:-1}})
        })
        it("should limit queries", function () {
            var results = q2m(qs.parse("limit=100"), {maxLimit: 50})
            assert.ok(results.options)
            assert.deepEqual(results.options, {limit: 50})
        })
    })
})
