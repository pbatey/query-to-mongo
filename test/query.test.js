var q2m = require("../index")

describe("query-to-mongo(query) =>", function () {
    describe(".criteria", function () {
        it("should create criteria", function () {
            var results = q2m("field=value")
            expect(results.criteria).toEqual({field: "value"})
        })
        it("should create numeric criteria", function () {
            var results = q2m("i=10&f=1.2&z=0")
            expect(results.criteria).toEqual({"i": 10, "f": 1.2, "z": 0})
        })
        it("should not create numeric criteria", function () {
            var results = q2m("foo=5e8454301455190020332048")
            expect(results.criteria).toEqual({foo: "5e8454301455190020332048"})
        })
        it("should create boolean criteria", function () {
            var results = q2m("t=true&f=false")
            expect(results.criteria).toEqual({t: true, f: false})
        })
        it("should create regex criteria", function () {
            var results = q2m("r=/regex/&ri=/regexi/i")
            expect(results.criteria).toEqual({r: /regex/, ri: /regexi/i})
        })
        it("should create regex criteria with comma", function () {
            var results = q2m("r=/reg,ex/&ri=/reg,exi/i")
            expect(results.criteria).toEqual({r: /reg,ex/, ri: /reg,exi/i})
        })
        it("should create Date criteria from YYYY-MM", function () {
            var results = q2m("d=2010-04")
            expect(results.criteria.d).toBeInstanceOf(Date)
            expect(results.criteria).toEqual({d: new Date(Date.UTC(2010, 3, 1))})
        })
        it("should create Date criteria from YYYY-MM-DD", function () {
            var results = q2m("d=2010-04-01")
            expect(results.criteria.d).toBeInstanceOf(Date)
            expect(results.criteria).toEqual({d: new Date(Date.UTC(2010, 3, 1))})
        })
        it("should create Date criteria from YYYY-MM-DDThh:mmZ", function () {
            var results = q2m("d=2010-04-01T12:00Z")
            expect(results.criteria.d).toBeInstanceOf(Date)
            expect(results.criteria).toEqual({d: new Date(Date.UTC(2010, 3, 1, 12, 0))})
        })
        it("should create Date criteria from YYYY-MM-DDThh:mm:ssZ", function () {
            var results = q2m("d=2010-04-01T12:00:30Z")
            expect(results.criteria.d).toBeInstanceOf(Date)
            expect(results.criteria).toEqual({d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30))})
        })
        it("should create Date criteria from YYYY-MM-DDThh:mm:ss.sZ", function () {
            var results = q2m("d=2010-04-01T12:00:30.250Z")
            expect(results.criteria.d).toBeInstanceOf(Date)
            expect(results.criteria).toEqual({d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250))})
        })
        it("should create Date criteria from YYYY-MM-DDThh:mm:ss.s-hh:mm", function () {
            var results = q2m("d=2010-04-01T11:00:30.250-01:00")
            expect(results.criteria.d).toBeInstanceOf(Date)
            expect(results.criteria).toEqual({d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250))})
        })
        it("should create Date criteria from YYYY-MM-DDThh:mm:ss.s+hh:mm", function () {
            var results = q2m(encodeURIComponent("d=2010-04-01T13:00:30.250+01:00"))
            expect(results.criteria.d).toBeInstanceOf(Date)
            expect(results.criteria).toEqual({d: new Date(Date.UTC(2010, 3, 1, 12, 0, 30, 250))})
        })
        it("should create $gt criteria", function () {
            var results = q2m("field>value")
            expect(results.criteria).toEqual({field: {"$gt": "value"}})
        })
        it("should create $lt criteria", function () {
            var results = q2m("field<value")
            expect(results.criteria).toEqual({field: {"$lt": "value"}})
        })
        it("should create $gte criteria", function () {
            var results = q2m("field>=value")
            expect(results.criteria).toEqual({field: {"$gte": "value"}})
        })
        it("should create $lte criteria", function () {
            var results = q2m("field<=value")
            expect(results.criteria).toEqual({field: {"$lte": "value"}})
        })
        it("should create $ne criteria", function () {
            var results = q2m("field!=value")
            expect(results.criteria).toEqual({field: {"$ne": "value"}})
        })
        it("should create $not criteria", function () {
            var results = q2m("field!=/.*value*./i")
            expect(results.criteria).toEqual({field: {"$not": /.*value*./i}})
        })

        it("should create $gt criteria from value", function () {
            var results = q2m("field=%3Evalue")
            expect(results.criteria).toEqual({field: {"$gt": "value"}})
        })  
        it("should create $lt criteria from value", function () {
            var results = q2m("field=%3Cvalue")
            expect(results.criteria).toEqual({field: {"$lt": "value"}})
        })  
        it("should create $gte criteria from value", function () {
            var results = q2m("field=%3E%3Dvalue")
            expect(results.criteria).toEqual({field: {"$gte": "value"}})
        })  
        it("should create $lte criteria from value", function () {
            var results = q2m("field=%3C%3Dvalue")
            expect(results.criteria).toEqual({field: {"$lte": "value"}})
        })  
        it("should create $ne criteria from value", function () {
            var results = q2m("field=%21%3Dvalue")
            expect(results.criteria).toEqual({field: {"$ne": "value"}})
        })
        it("should create $not criteria from /.*value*./i", function () {
            var results = q2m("field=%21%3D/.*value*./i")
            expect(results.criteria).toEqual({field: {"$not": /.*value*./i}})
        })
        it("should create $ne criteria from !value", function () {
            var results = q2m("field=%21value")
            expect(results.criteria).toEqual({field: {"$ne": "value"}})
        })
        it("should create $nin criteria from multiple !value", function () {
            var results = q2m("field=%21a&field=%21b")
            expect(results.criteria).toEqual({field: {"$nin": ["a","b"] }})
        })
        it("should create $not criteria from !/.*value*./i", function () {
            var results = q2m("field=%21/.*value*./i")
            expect(results.criteria).toEqual({field: {"$not": /.*value*./i}})
        })

        it("should create $in criteria", function () {
            var results = q2m("field=a&field=b")
            expect(results.criteria).toEqual({field: {"$in": ["a","b"]}})
        })
        it("should create $nin criteria", function () {
            var results = q2m("field!=a&field!=b")
            expect(results.criteria).toEqual({field: {"$nin": ["a","b"]}})
        })
        it("should create mixed criteria", function () {
            var results = q2m("field!=10&field!=20&field>3")
            expect(results.criteria).toEqual({field: {"$nin": [10,20], "$gt": 3}})
        })
        it("should create range criteria",function () {
            var results = q2m("field>=10&field<=20")
            expect(results.criteria).toEqual({field: {"$gte": 10, "$lte": 20}})
        })
        it("should ignore criteria", function () {
            var results = q2m("field=value&envelope=true&&offset=0&limit=10&fields=id&sort=name", { ignore: ['envelope']})
            expect(results.criteria.envelope).toBe(undefined)
            expect(results.criteria.skip).toBe(undefined)
            expect(results.criteria.limit).toBe(undefined)
            expect(results.criteria.fields).toBe(undefined)
            expect(results.criteria.sort).toBe(undefined)
            expect(results.criteria).toEqual({field: "value"})
        })
        it("should create $exists criteria from value", function () {
            var results = q2m("a=&b=%21")
            expect(results.criteria).toEqual({a: {"$exists": true}, b: {"$exists": false} } )
        })
        it("should create $exists true criteria", function () {
            var results = q2m("a&b=10&c", { ignore: ['c']})
            expect(results.criteria).toEqual({a: {"$exists": true}, b: 10})
        })
        it("should create $exists false criteria", function () {
            var results = q2m("!a&b=10&c", { ignore: ['c']})
            expect(results.criteria).toEqual({a: {"$exists": false}, b: 10})
        })
        it("should create $type criteria with BSON type number", function () {
            var results = q2m("field:type=2")
            expect(results.criteria).toEqual({field: {$type: 2} })
        })
        it("should create $type criteria with BSON type name", function () {
            var results = q2m("field:type=string")
            expect(results.criteria).toEqual({field: {$type: "string"} })
        })
        it("should create $size criteria", function () {
            var results = q2m("array:size=2")
            expect(results.criteria).toEqual({array: {$size: 2} })
        })
        it("should create $all criteria", function () {
            var results = q2m("array:all=50,60")
            expect(results.criteria).toEqual({array: {$all: [50, 60]} })
        })
        it("should create forced string criteria", function () {
            var results = q2m("s='a,b'")
            expect(results.criteria).toEqual({s: "a,b"})
        })
        it("should create numeric criteria from YYYY exception", function () {
            var results = q2m("d=2016")
            expect(results.criteria).toEqual({d: 2016})
        })
    })

    describe(".options", function () {
        it("should create paging options", function () {
            var results = q2m("offset=8&limit=16")
            expect(results.options).toEqual({skip: 8, limit: 16})
        })
        it("should create field option", function () {
            var results = q2m("fields=a,b,c")
            expect(results.options).toEqual({fields: {a:1, b:1, c:1}})
        })
        it("should create omit option", function () {
            var results = q2m("omit=b")
            expect(results.options).toEqual({fields: {b:0}})
        })
        it("should create sort option", function () {
            var results = q2m("sort=a,+b,-c")
            expect(results.options).toEqual({sort: {a:1, b:1, c:-1}})
        })
        it("should limit queries", function () {
            var results = q2m("limit=100", {maxLimit: 50})
            expect(results.options).toEqual({limit: 50})
        })
    })

    describe(".options (altKeywords)", function () {
        it("should create paging options", function () {
            var altKeywords = {fields:'$fields', offset:'$offset', limit:'$limit', sort: '$sort', omit: '$omit'}
            var results = q2m("$offset=8&$limit=16", {keywords: altKeywords})
            expect(results.options).toEqual({skip: 8, limit: 16})
        })
        it("should create field option", function () {
            var altKeywords = {fields:'$fields', offset:'$offset', limit:'$limit', sort: '$sort', omit: '$omit'}
            var results = q2m("$fields=a,b,c", {keywords: altKeywords})
            expect(results.options).toEqual({fields: {a:1, b:1, c:1}})
        })
        it("should create omit option", function () {
            var altKeywords = {fields:'$fields', offset:'$offset', limit:'$limit', sort: '$sort', omit: '$omit'}
            var results = q2m("$omit=b", {keywords: altKeywords})
            expect(results.options).toEqual({fields: {b:0}})
        })
        it("should create sort option", function () {
            var altKeywords = {fields:'$fields', offset:'$offset', limit:'$limit', sort: '$sort', omit: '$omit'}
            var results = q2m("$sort=a,+b,-c", {keywords: altKeywords})
            expect(results.options).toEqual({sort: {a:1, b:1, c:-1}})
        })
        it("should limit queries", function () {
            var altKeywords = {fields:'$fields', offset:'$offset', limit:'$limit', sort: '$sort', omit: '$omit'}
            var results = q2m("$limit=100", {maxLimit: 50, keywords: altKeywords})
            expect(results.options).toEqual({limit: 50})
        })
    })
})
