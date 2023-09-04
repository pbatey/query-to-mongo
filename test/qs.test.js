var q2m = require("../index")
var qs = require("qs")

describe("query-to-mongo(query,{paser: qs}) =>", function () {
    describe(".criteria", function () {
        it("should create criteria", function () {
            var results = q2m("foo[bar]=value", {parser: qs})
            expect(results.criteria).toEqual({foo: {bar: "value"}})
        })
        it("should create numeric criteria", function () {
            var results = q2m("foo[i]=10&foo[f]=1.2&foo[z]=0", {parser: qs})
            expect(results.criteria).toEqual({foo:{"i": 10, "f": 1.2, "z": 0}})
        })
        it("should not create numeric criteria", function () {
            var results = q2m("foo=5e8454301455190020332048", {parser: qs})
            expect(results.criteria).toEqual({foo: "5e8454301455190020332048"})
        })
        it("should create boolean criteria", function () {
            var results = q2m("foo[t]=true&foo[f]=false", {parser: qs})
            expect(results.criteria).toEqual({foo:{t: true, f: false}})
        })
        it("should create regex criteria", function () {
            var results = q2m("foo[r]=/regex/&foo[ri]=/regexi/i", {parser: qs})
            expect(results.criteria).toEqual({foo:{r: /regex/, ri: /regexi/i}})
        })
        // can't create comparisons for embedded documents
        it("shouldn't ignore deep criteria", function () {
            var results = q2m("field=value&foo[envelope]=true", {ignore: ['envelope'], parser: qs})
            expect(results.criteria).toEqual({field: "value", foo: {envelope: true}})
        })
        it("should create string criteria when forced with a quote", function () {
            var results = q2m("a='10'&b='11'&c='a,b'&d=10,11&z=\"that's all folks\"", {parser: qs})
            expect(results.criteria).toEqual({a: "10", b: "11", c: "a,b", d: {$in: [10, 11]}, z: "that's all folks"})
        })
    })

    describe(".options", function () {
        it("should create paging options", function () {
            var results = q2m("offset=8&limit=16", {parser: qs})
            expect(results.options).toEqual({skip: 8, limit: 16})
        })
        it("should create field option", function () {
            var results = q2m("fields=a,b,c", {parser: qs})
            expect(results.options).toEqual({fields: {a:1, b:1, c:1}})
        })
        it("should create sort option", function () {
            var results = q2m("sort=a,+b,-c", {parser: qs})
            expect(results.options).toEqual({sort: {a:1, b:1, c:-1}})
        })
        it("should limit queries", function () {
            var results = q2m("limit=100", {maxLimit: 50, parser: qs})
            expect(results.options).toEqual({limit: 50})
        })
    })

    describe("#links", function () {
        var links = q2m("foo[bar]=baz&offset=20&limit=10", {maxLimit: 50, parser: qs}).links('http://localhost', 100)
        it("should create first link", function () {
            expect(links.first).toBe("http://localhost?foo%5Bbar%5D=baz&offset=0&limit=10")
        })
        it("should create prev link", function () {
            expect(links.prev).toBe("http://localhost?foo%5Bbar%5D=baz&offset=10&limit=10")
        })
        it("should create next link", function () {
            expect(links.next).toBe("http://localhost?foo%5Bbar%5D=baz&offset=30&limit=10")
        })
        it("should create last link", function () {
            expect(links.last).toBe("http://localhost?foo%5Bbar%5D=baz&offset=90&limit=10")
        })
    })
})
