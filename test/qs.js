var assert = require("chai").assert
var q2m = require("../index")
var qs = require("qs")

describe("query-to-mongo(query,{paser: qs}) =>", function () {
    describe(".criteria", function () {
        it("should create criteria", function () {
            var results = q2m("foo[bar]=value", {parser: qs})
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo: {bar: "value"}})
        })
        it("should create numeric criteria", function () {
            var results = q2m("foo[i]=10&foo[f]=1.2", {parser: qs})
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo:{"i": 10, "f": 1.2}})
        })
        it("should create boolean criteria", function () {
            var results = q2m("foo[t]=true&foo[f]=false", {parser: qs})
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {foo:{t: true, f: false}})
        })
        // can't create comparisons for embedded documents
        it("shouldn't ignore deep criteria", function () {
            var results = q2m("field=value&foo[envelope]=true", {ignore: ['envelope'], parser: qs})
            assert.ok(results.criteria)
            assert.deepEqual(results.criteria, {field: "value", foo: {envelope: true}})
        })
    })

    describe(".options", function () {
        it("should create paging options", function () {
            var results = q2m("offset=8&limit=16", {parser: qs})
            assert.ok(results.options)
            assert.deepEqual(results.options, {skip: 8, limit: 16})
        })
        it("should create field option", function () {
            var results = q2m("fields=a,b,c", {parser: qs})
            assert.ok(results.options)
            assert.deepEqual(results.options, {fields: {a:true, b:true, c:true}})
        })
        it("should create sort option", function () {
            var results = q2m("sort=a,+b,-c", {parser: qs})
            assert.ok(results.options)
            assert.deepEqual(results.options, {sort: {a:1, b:1, c:-1}})
        })
        it("should limit queries", function () {
            var results = q2m("limit=100", {maxLimit: 50, parser: qs})
            assert.ok(results.options)
            assert.deepEqual(results.options, {limit: 50})
        })
    })

    describe("#links", function () {
        var links = q2m("foo[bar]=baz&offset=20&limit=10", {maxLimit: 50, parser: qs}).links('http://localhost', 100)
        it("should create first link", function () {
            assert.equal(links.first, "http://localhost?foo%5Bbar%5D=baz&offset=0&limit=10")
        })
        it("should create prev link", function () {
            assert.equal(links.prev, "http://localhost?foo%5Bbar%5D=baz&offset=10&limit=10")
        })
        it("should create next link", function () {
            assert.equal(links.next, "http://localhost?foo%5Bbar%5D=baz&offset=30&limit=10")
        })
        it("should create last link", function () {
            assert.equal(links.last, "http://localhost?foo%5Bbar%5D=baz&offset=90&limit=10")
        })
    })
})
