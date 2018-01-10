let StormLib;

if (process.env.NODE_ENV === 'production') {
  StormLib = require('./stormlib.release.js');
} else {
  StormLib = require('./stormlib.debug.js');
}

let resolveReady, rejectReady;

const ready = new Promise((resolve, reject) => {
  resolveReady = resolve;
  rejectReady = reject;
});

const library = StormLib({
  onRuntimeInitialized: function() {
    // Temporary workaround for emscripten pseudo-promise
    delete library.then;

    if (process.env.NODE_ENV !== 'production') {
      console.info('Initialized StormLib in debug mode');
    }

    resolveReady(library);
  }
});

library.ready = ready;

module.exports = library;
