let StormLib;

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line import/no-unresolved
  StormLib = require('./stormlib.release.js');
} else {
  // eslint-disable-next-line import/no-unresolved
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

    // Add NULLPTR constant
    library.NULLPTR = new library.Ptr();

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info('Initialized StormLib in debug mode');
    }

    resolveReady(library);
  }
});

library.ready = ready;

module.exports = library;
