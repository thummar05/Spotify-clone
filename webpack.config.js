const path = require('path');

module.exports = {
   

  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      fs: false, 
      stream: require.resolve('stream-browserify'),
    },
  },
};
