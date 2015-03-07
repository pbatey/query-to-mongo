# query-to-mongodb
Node.js package to convert query parameters into a mongodb query criteria and options

For example, a query such as: `field1=john&field2>10&fields=field1,field2&sort=field1,-field2&offset=10&limit=10` becomes the following hash:
```
{
  criteria: {
    field1: 'john',
    field2: { $gt: 10 }
  },
  options: {
    fields: {field1:true,field2:true},
    sort: {field1:1,field2:-1},
    offset: 10,
    limit: 10
  }
}
```
The format of the arguments was inspired by item #7 in this article about best practices for RESTful apis:
http://blog.mwaysolutions.com/2014/06/05/10-best-practices-for-better-restful-api/.

## Install
```
$ npm install query-to-monogdb
```

### queryToMongoDb(query, options)
Convert output of querystring.parse to a mongo query.
```
var queryToMongoDb = require('query-to-mongodb')
var query = 'name=john&age>13&limit=10'
querytoMongoDb(querystring.parse(query)) //=> {criteria: {field1: "john", age: {"$gt": 13}}, options: {limit: 10}}
```

#### options:
* **maxLimit** The maximum limit (default is none)
* **ignore** List of criteria to ignore in addition to the options ("fields", "sort", "offset", "limit")

## Usage
The module is intended for use by express routes, and so takes the results of querystring.parse as input:
```
var querystring = require('querystring');
var q2m = require('query-to-mongodb');
var query = 'field1=john&field2>10&fields=field1,field2&sort=field1,-field2&offset=10&limit=10';
var q = q2m(querystring.parse(query));
```
This makes it easy to use in an express route:
```
router.get('/api/v1/mycollection', function(req, res, next) {
  var q = q2m(res.query);
  ...
}
```

The resulting query object can then be used as parameters for a mongodb query:
```
var mongoskin = require('mongoskin');
var db = mongoskin.db('mongodb://localhost:27027/mydb');
var collection = db.collection('mycollection');
collection.find(q.criteria, q.options).toArray(function(err, results) {
  ...
});
```

## Field selection
The _fields_ argument is a comma separated list of field names to include in the results. For example `fields=field1,field2` results in a _option.fields_ value of `{'field1':true,'field2':true}`. If no fields are specified then _option.fields_ is null, returning full documents as results.

## Sorting
The _sort_ argument is a comma separated list of fields to sort the results by. For example `sort=field1,-field2` results in a _option.sort_ value of `{'field1':1,'field2':-1}`. If no sort is specified then _option.sort_ is null and the results are not sorted.

## Paging
The _offset_ and _limit_ arguments indicate the subset of the full results to return. By default, the full results are returned. If _limit_ is set and the total count is obtained for the query criteria, pagination links can be generated:
```
collection.count(q.query, function(err, count) {
  var links = q.links('http://localhost/api/v1/mycollection', count);
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
These pagination links can be used to populate the express response links. See http://expressjs.com/4x/api.html#res.links.

## Filtering
Any query parameters other then _fields_, _sort_, _offset_, and _limit_ are interpreted as query criteria. For example `field1=john&field2>10` results in a _criteria_ value of:
```
{
  'field1': 'john',
  'field2': { $gt: 10 }
}
```

* Supports standard comparison operations (=, !=, >, <, >=, <=).
* Numeric values, where `Number(value) != NaN`, are compared as numbers (ie., `field=10 yields` yields `{field:10}`).
* Values of _true_ and _false_ are compared as booleans (ie., `{field:true}`)
* Multiple equals comparisons are merged into a `$in` operator. For example, `id=a&id=b` yields `{id:{$in:['a','b']}}`.
* Multiple not-equals comparisons are merged into a `$nin` operator. For example, `id!=a&id!=b` yields `{id:{$nin:['a','b']}}`.
* Comma separated values in equals or not-equals yeild an `$in` or `$nin` operator. For example, `id=a,b` yields `{id:{$in:['a','b']}}`.

## Todo
* Add support for `$exists`. Arguments w/o a value (ie., `field1&field2=10`) would yield `{'field1':{$exists:true},...}`; prefixed with not(!) (ie., `!field1&field2=10`) would yield `{'field1': {$exists: false},...}`.
* Add support for `$regex`. Values with slashes (field=/pattern/) would result in `{'field':{$regex: /pattern/}}`. Don't forget case-insensitive patterns (/pattern/i).
* Add support for forced string comparison; value in quotes (`field='10'`) would force a string compare. Should allow for string with embedded comma (`field='a,b'`).
