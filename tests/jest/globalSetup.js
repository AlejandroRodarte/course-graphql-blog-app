// @babel/register allows to require JavaScript files that use modern syntax 
// (for some reason Jest does not the import statement yet)
require('@babel/register');

// Babel 7 imports
require('core-js/stable');
require('regenerator-runtime/runtime');

// import the GraphQLServer instance default
const server = require('../../src/server').default;

// this is the method that will be called by jest before starting the test suite
// kickstart the Node.js server on port 4000
module.exports = async () => {
    global.httpServer = await server.start({ port: 4000 });
};