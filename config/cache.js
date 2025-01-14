//caching using NodeCache

const NodeCache = require('node-cache');

//cache with 5 min TTL
const cache = new NodeCache({ stdTTL: 300 });

module.exports = cache;