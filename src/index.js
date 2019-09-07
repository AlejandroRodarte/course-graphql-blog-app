// Babel 7 imports
import 'core-js/stable';
import 'regenerator-runtime/runtime'

// import the GraphQLServer instance
import server from './server';

// kickstart the server (default port: 4000, if not, use Heroku's dynamic port when deployed to production)
server.start({ port: process.env.PORT || 4000 }, () => {
    console.log('The server is up!');
});