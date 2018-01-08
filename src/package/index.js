if (process.env.NODE_ENV === 'production') {
  module.exports = require('./stormjs.release');
} else {
  module.exports = require('./stormjs.debug');
}
