import { GraphQLServer, PubSub } from 'graphql-yoga';
import db from './db';
import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import Subscription from './resolvers/Subscription';
import User from './resolvers/User';
import Post from './resolvers/Post';
import Comment from './resolvers/Comment';

// import the prisma-binding instance to use its methods
// (prisma.query, prisma.mutation, prisma.subscription, prisma.exists)
import prisma from './prisma';

// we publisher-subscriber instance
const pubsub = new PubSub();

// set up the GraphQL server
// typeDefs: pointer to the file that has our type definitions
// resolvers: The imported resolvers from all the files
// pass the publisher-subscriber utility in the context so we can share it between resolvers
const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers: {
        Query,
        Mutation,
        Subscription,
        User,
        Post,
        Comment
    },
    context(request) {
        return {
            db,
            pubsub,
            prisma,
            request
        }
    }
});

// kickstart the server (default port: 4000)
server.start(() => {
    console.log('The server is up!');
});