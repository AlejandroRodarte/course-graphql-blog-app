import { GraphQLServer, PubSub } from 'graphql-yoga';
import db from './db';
import { resolvers, fragmentReplacements } from './resolvers/index';

// import the prisma-binding instance to use its methods
// (prisma.query, prisma.mutation, prisma.subscription, prisma.exists)
import prisma from './prisma';

// we publisher-subscriber instance
const pubsub = new PubSub();

// set up the GraphQL server
// typeDefs: pointer to the file that has our type definitions
// resolvers: The imported resolvers from all the files
// pass the publisher-subscriber utility in the context so we can share it between resolvers

// make the GraphQLServer also use the declared fragments from our resolver definitions
const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context(request) {
        return {
            db,
            pubsub,
            prisma,
            request
        }
    },
    fragmentReplacements
});

// kickstart the server (default port: 4000)
server.start(() => {
    console.log('The server is up!');
});