const StormLib = require('stormlib');

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
