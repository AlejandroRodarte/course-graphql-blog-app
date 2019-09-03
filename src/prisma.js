// file to connect to the Prisma GraphQL API
import { Prisma } from 'prisma-binding';

// create the connection
const prisma = new Prisma({
    typeDefs: '',
    endpoint: 'http://192.168.99.100:4466/'
});