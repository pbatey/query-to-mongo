var q2m = require("../index")

describe("query-to-mongo(query).links =>", function () {
    describe("#links", function () {
        var links = q2m("offset=20&limit=10").links('http://localhost', 95)
        it("should create first link", function () {
            expect(links.first).toBe("http://localhost?offset=0&limit=10")
        })
        it("should create prev link", function () {
            expect(links.prev).toBe("http://localhost?offset=10&limit=10")
        })
        it("should create next link", function () {
            expect(links.next).toBe("http://localhost?offset=30&limit=10")
        })
        it("should create last link", function () {
            expect(links.last).toBe("http://localhost?offset=90&limit=10")
        })

        describe("with no pages", function () {
            var links = q2m("offset=0&limit=100").links('http://localhost', 95)
            it("should not create links", function () {
                expect(links.first).toBe(undefined)
                expect(links.last).toBe(undefined)
                expect(links.next).toBe(undefined)
                expect(links.prev).toBe(undefined)
            })
        })
        describe("when on first page", function () {
            var links = q2m("offset=0&limit=10").links('http://localhost', 95)
            it("should not create prev link", function () {
                expect(links.prev).toBe(undefined)
            })
            it("should not create first link", function () {
                expect(links.first).toBe(undefined)
            })
            it("should create next link", function () {
                expect(links.next).toBe("http://localhost?offset=10&limit=10")
            })
            it("should create last link", function () {
                expect(links.last).toBe("http://localhost?offset=90&limit=10")
            })
        })
        describe("when on last page", function () {
            var links = q2m("offset=90&limit=10").links('http://localhost', 95)
            it("should not create next link", function () {
                expect(links.next).toBe(undefined)
            })
            it("should not create last link", function () {
                expect(links.last).toBe(undefined)
            })
            it("should create prev link", function () {
                expect(links.prev).toBe("http://localhost?offset=80&limit=10")
            })
            it("should not create first link", function () {
                expect(links.first).toBe("http://localhost?offset=0&limit=10")
            })
        })
    })
})
