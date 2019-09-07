// Babel 7 imports for async/await support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import ApolloBoost, { gql } from 'apollo-boost';
import prisma from '../src/prisma';

// enabling apollo boost to make GraphQL queries
const client = new ApolloBoost({
    uri: 'http://localhost:4000'
});

// test: create a user in the database
test('Should create a new user.', async () => {

    // type in the correct GraphQL query; parse with gql
    const createUser = gql`
        mutation {
            createUser(
                data: {
                    name: "Magdaleno Rodriguez",
                    email: "max@gmail.com",
                    password: "guadalupana"
                }
            ) {
                user {
                    id
                }
                token
            }
        }
    `;

    // fire off the mutation; get the promised response data
    const response = await client.mutate({ mutation: createUser });

    // check if user was persisted properly to the database
    const userExists = await prisma.exists.User({
        id: response.data.createUser.user.id
    });

    // expect the promised boolean to be true
    expect(userExists).toBe(true);
    

});