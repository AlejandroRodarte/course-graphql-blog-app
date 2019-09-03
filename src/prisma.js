// file to connect to the Prisma GraphQL API
import { Prisma } from 'prisma-binding';

// create the connection
const prisma = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: 'http://192.168.99.100:4466'
});

// four key properties on the prisma object: query, mutation, subscription, exists (utility methods)

// Prisma queries (reading data from the database)

// accessing the 'users' query as a method through prisma.query
// all query, mutation and subscription methods accept 2 arguments: 
// operation arguments and the selection set

// in this case, we do not need to pass any operation arguments, while the selection
// argument is declared in an object fashion but as a string, placing the names of the fields
// we want to query

// the idea is that in this two arguments we pass in the data we would type in the GraphQL Playground, 
// just that in this format it looks pretty ugly

// for example, here we access the user posts and its comments as if we were typing the query on the Playground
// we use JSON.stringify() to impede console.log() to hide nested JSON data
prisma.query.users(null, '{ id name posts { id title comments { id text } } }')
    .then(data => console.log(JSON.stringify(data, undefined, 2)));

// getting all comments with their author information
prisma.query.comments(null, '{ id text author { id name } }')
    .then(data => console.log(JSON.stringify(data, undefined, 2)));