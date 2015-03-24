var querystring = require('querystring')
var iso8601 = require('./lib/iso8601-regex')

// Convert comma separate list to a mongo projection.
// for example f('field1,field2,field3') -> {field1:true,field2:true,field3:true}
function fieldsToMongo(fields) {
    if (!fields) return null
    var hash = {}
    fields.split(',').forEach(function(field) {
        hash[field.trim()] = true
    })
    return hash
}

// Convert comma separate list to mongo sort options.
// for example f('field1,+field2,-field3') -> {field1:1,field2:1,field3:-1}
function sortToMongo(sort) {
    if (!sort) return null
    var hash = {}, c
    sort.split(',').forEach(function(field) {
        c = field.charAt(0)
        if (c == '-') field = field.substr(1)
        hash[field.trim()] = (c == '-') ? -1 : 1
    })
    return hash
}

// Convert String to Number, Date, or Boolean if possible
function typedValue(value) {
    var n = Number(value)
    if (n && n != NaN) return n
    if (iso8601.test(value)) return new Date(value)
    return (value == 'true') || ((value == 'false') ? false : value)
}

// Convert a key/value pair split at an equals sign into a mongo comparison.
// Converts value Strings to Numbers or Booleans when possible.
// for example:
// + f('key','value') => {key:'key',value:'value'}
// + f('key>','value') => {key:'key',value:{$gte:'value'}}
function comparisonToMongo(key, value) {
    var join = (value == '') ? key : key.concat('=', value)
    var parts = join.match(/([^><!=]+)([><]=?|!?=)(.+)/)
    var op, hash = {}
    if (!parts) return null

    key = parts[1]
    op = parts[2]

    if (op == '=' || op == '!=') {
        var array = []
        parts[3].split(',').forEach(function(value) {
            array.push(typedValue(value))
        })
        if (array.length > 1) {
            value = {}
            op = (op == '=') ? '$in' : '$nin'
            value[op] = array
        } else if (op == '!=') {
            value = { '$ne': array[0] }
        } else {
            value = array[0]
        }
    } else {
        value = typedValue(parts[3])
        if (op == '>') value = {'$gt': value}
        else if (op == '>=') value = {'$gte': value}
        else if (op == '<') value = {'$lt': value}
        else if (op == '<=') value = { '$lte': value}
    }

    hash.key = key
    hash.value = value
    return hash
}

// Checks for keys that are ordinal positions, such as {'0':'one','1':'two','2':'three'}
function hasOrdinalKeys(obj) {
    var c = 0
    for (var key in obj) {
        if (Number(key) !== c++) return false
    }
    return true
}

// Convert query parameters to a mongo query criteria.
// for example {field1:"red","field2>2":""} becomes {field1:"red",field2:{$gt:2}}
function queryCriteriaToMongo(query, options) {
    var hash = {}, p, v, deep
    options = options || {}
    for (var key in query) {
        if (query.hasOwnProperty(key) && (!options.ignore || options.ignore.indexOf(key) == -1)) {
            deep = (typeof query[key] === 'object' && !hasOrdinalKeys(query[key]))

            if (deep) {
                hash[key] = queryCriteriaToMongo(query[key])
            } else {
                p = comparisonToMongo(key, query[key])
                if (p) {
                    hash[p.key] = p.value
                }
            }
        }
    }
    return hash
}

// Convert query parameters to a mongo query options.
// for example {fields:'a,b',offset:8,limit:16} becomes {fields:{a:true,b:true},skip:8,limit:16}
function queryOptionsToMongo(query, options) {
    var hash = {},
        fields = fieldsToMongo(query.fields),
        sort = sortToMongo(query.sort),
        maxLimit = options.maxLimit || 9007199254740992,
        limit = options.maxLimit || 0

    if (fields) hash.fields = fields
    if (sort) hash.sort = sort

    if (query.offset) hash.skip = Number(query.offset)
    if (query.limit) limit = Math.min(Number(query.limit), maxLimit)
    if (limit) {
        hash.limit = limit
    } else if (options.maxLimit) {
        hash.limit = maxLimit
    }

    return hash
}

module.exports = function(query, options) {
    options = options || {}

    if (!options.ignore) {
        options.ignore = []
    } else {
        options.ignore = (typeof options.ignore === 'string') ? [options.ignore] : options.ignore
    }
    options.ignore = options.ignore.concat(['fields', 'sort', 'skip', 'limit'])
    if (!options.parser) options.parser = querystring

    if (typeof query === 'string') query = options.parser.parse(query)

    return {
        criteria: queryCriteriaToMongo(query, options),
        options: queryOptionsToMongo(query, options),

        links: function(url, totalCount) {
            var offset = this.options.skip || 0
            var limit = Math.min(this.options.limit || 0, totalCount)
            var links = {}
            var last = {}

            if (!limit) return null

            options = options || {}

            if (offset > 0) {
                query.offset = Math.max(offset - limit, 0)
                links['prev'] = url + '?' + options.parser.stringify(query)
                query.offset = 0
                links['first'] = url + '?' + options.parser.stringify(query)
            }
            if (offset + limit < totalCount) {
                last.pages = Math.ceil(totalCount / limit)
                last.offset = (last.pages - 1) * limit

                query.offset = Math.min(offset + limit, last.offset)
                links['next'] = url  + '?' + options.parser.stringify(query)
                query.offset = last.offset
                links['last'] = url  + '?' + options.parser.stringify(query)
            }
            return links
        }
    }
}
