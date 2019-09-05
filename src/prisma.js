// file to connect to the Prisma GraphQL API
import { Prisma } from 'prisma-binding';

// import the declared fragments from our resolvers
import { fragmentReplacements } from './resolvers/index';

// create the connection: point to the type definition filename path
// and also indicate the Prisma server we are going to connect to
// the secret field must match the one we have set on our prisma project in the prisma.yml file

// import the fragment replacements
const prisma = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: 'http://192.168.99.100:4466',
    secret: 'my-super-secret-password',
    fragmentReplacements
});

// export prisma to be able to use it on our resolvers through the context
export { prisma as default };