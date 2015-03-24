# query-to-mongo
Node.js package to convert query parameters into a [mongo](https://www.mongodb.org) query criteria and options

For example, a query such as: `name=john&age>21&fields=name,age&sort=name,-age&offset=10&limit=10` becomes the following hash:
```javascript
{
  criteria: {
    name: 'john',
    age: { $gt: 21 }
  },
  options: {
    fields: { name: true, age: true },
    sort: { name: 1, age: -1 },
    offset: 10,
    limit: 10
  }
}
```
The resulting query object can be used as parameters for a mongo collection query:
```javascript
var q2m = require('query-to-mongo')
var mongoskin = require('mongoskin')
var db = mongoskin.db('mongodb://localhost:27027/mydb')
var collection = db.collection('mycollection')
var query = q2m('name=john&age>13&limit=20')
collection.find(query.criteria, query.options).toArray(function(err, results) {
  ...
})
```

## API
### queryToMongo(query, options)
Convert the query portion of a url to a mongo query.
```javascript
var queryToMongo = require('query-to-mongo')
var query = queryToMongo('name=john&age>21&limit=10')
console.log(query)
```
```javascript
{ criteria: { name: 'john', age: { '$gt': 21 } },
  options: { limit: 10 },
  links: [Function] }
```

#### options:
* **maxLimit** The maximum limit (default is none)
* **ignore** List of criteria to ignore in addition to those used for query options ("fields", "sort", "offset", "limit")
* **parser** Query parser to use instead of _querystring_. Must implement `parse(string)` and `stringify(obj)`.

#### returns:
* **criteria** Mongo query criteria.
* **options** Mongo query options.
* **links** Function to calculate relative links.

##### links(url, totalCount)
Calculate relative links given the base url and totalCount. Can be used to populate the [express response links](http://expressjs.com/4x/api.html#res.links).
```javascript
var queryToMongo = require('query-to-mongo')
var query = queryToMongo('name=john&age>21&offset=20&limit=10')
console.log(query.links('http://localhost/api/v1/users', 100))
```
```javascript
{ prev: 'http://localhost/api/v1/users?name=john&age%3E21=&offset=10&limit=10',
  first: 'http://localhost/api/v1/users?name=john&age%3E21=&offset=0&limit=10',
  next: 'http://localhost/api/v1/users?name=john&age%3E21=&offset=30&limit=10',
  last: 'http://localhost/api/v1/users?name=john&age%3E21=&offset=90&limit=10' }
```

## Use
The module is intended for use by express routes, and so takes a parsed query as input:
```
var querystring = require('querystring')
var q2m = require('query-to-mongo')
var query = 'name=john&age>21&fields=name,age&sort=name,-age&offset=10&limit=10'
var q = q2m(querystring.parse(query))
```
This makes it easy to use in an express route:
```
router.get('/api/v1/mycollection', function(req, res, next) {
  var q = q2m(res.query);
  ...
}
```

The format for arguments was inspired by item #7 in [this article](http://blog.mwaysolutions.com/2014/06/05/10-best-practices-for-better-restful-api/) about best practices for RESTful APIs.

### Field selection
The _fields_ argument is a comma separated list of field names to include in the results. For example `fields=name,age` results in a _option.fields_ value of `{'name':true,'age':true}`. If no fields are specified then _option.fields_ is null, returning full documents as results.

### Sorting
The _sort_ argument is a comma separated list of fields to sort the results by. For example `sort=name,-age` results in a _option.sort_ value of `{'name':1,'age':-1}`. If no sort is specified then _option.sort_ is null and the results are not sorted.

### Paging
The _offset_ and _limit_ arguments indicate the subset of the full results to return. By default, the full results are returned. If _limit_ is set and the total count is obtained for the query criteria, pagination links can be generated:
```
collection.count(q.query, function(err, count) {
  var links = q.links('http://localhost/api/v1/mycollection', count)
}
```
For example, if _offset_ was 20, _limit_ was 10, and _count_ was 95, the following links would be generated:
```
{
   'prev': 'http://localhost/api/v1/mycollection?offset=10&limit=10',
   'first': `http://localhost/api/v1/mycollection?offset=0&limit=10`,
   'next': 'http://localhost/api/v1/mycollection?offset=30&limit=10',
   'last': 'http://localhost/api/v1/mycollection?offset=90&limit=10'
}
```
These pagination links can be used to populate the [express response links](http://expressjs.com/4x/api.html#res.links).

### Filtering
Any query parameters other then _fields_, _sort_, _offset_, and _limit_ are interpreted as query criteria. For example `name=john&age>21` results in a _criteria_ value of:
```
{
  'name': 'john',
  'age': { $gt: 21 }
}
```

* Supports standard comparison operations (=, !=, >, <, >=, <=).
* Numeric values, where `Number(value) != NaN`, are compared as numbers (ie., `field=10` yields `{field:10}`).
* Values of _true_ and _false_ are compared as booleans (ie., `{field:true}`)
* Values that are [dates](http://www.w3.org/TR/NOTE-datetime) are compared as dates (except for YYYY which matches the number rule).
* Multiple equals comparisons are merged into a `$in` operator. For example, `id=a&id=b` yields `{id:{$in:['a','b']}}`.
* Multiple not-equals comparisons are merged into a `$nin` operator. For example, `id!=a&id!=b` yields `{id:{$nin:['a','b']}}`.
* Comma separated values in equals or not-equals yeild an `$in` or `$nin` operator. For example, `id=a,b` yields `{id:{$in:['a','b']}}`.

### A note on embedded documents
Comparisons on embedded documents should use mongo's [dot notation](http://docs.mongodb.org/manual/reference/glossary/#term-dot-notation) instead of express's 'extended' [query parser](https://www.npmjs.com/package/qs) (Use `foo.bar=value` instead of `foo[bar]=value`).

Although exact matches are handled for either method, comparisons (such as `foo[bar]!=value`) are not supported because the 'extended' parser expects an equals sign after the nested object reference; if it's not an equals the remainder is discarded.

## Todo
* Add support for `$exists`. Arguments w/o a value (ie., `foo&bar=10`) would yield `{'foo':{$exists:true}, 'bar':...}`; prefixed with not(!) (ie., `!foo&bar=10`) would yield `{'foo': {$exists: false}, 'bar': ...}`.
* Add support for `$regex`. Values with slashes (field=/pattern/) would result in `{'field':{$regex: /pattern/}}`. Don't forget case-insensitive patterns (/pattern/i).
* Add support for forced string comparison; value in quotes (`field='10'`) would force a string compare. Should allow for string with embedded comma (`field='a,b'`).
