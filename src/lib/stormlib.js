const StormLib = require('stormlib');

let resolveInit, rejectInit;

const init = new Promise((resolve, reject) => {
  resolveInit = resolve;
  rejectInit = reject;
});

const library = StormLib({
  onRuntimeInitialized: function() {
    // Temporary workaround for emscripten pseudo-promise
    delete library.then;

    if (process.env.NODE_ENV !== 'production') {
      console.info('Initialized StormLib in debug mode');
    }

    resolveInit(library);
  }
});

library.init = init;

module.exports = library;
