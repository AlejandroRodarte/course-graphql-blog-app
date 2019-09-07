// Babel 7 imports for async/await support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import ApolloBoost, { gql } from 'apollo-boost';
import prisma from '../src/prisma';
import bcrypt from 'bcryptjs';

// enabling apollo boost to make GraphQL queries
const client = new ApolloBoost({
    uri: 'http://localhost:4000'
});

// lifecycle method: runs before each unit test runs
beforeEach(async () => {

    // wipe out the database (users, posts and comments)
    await prisma.mutation.deleteManyComments();
    await prisma.mutation.deleteManyPosts();
    await prisma.mutation.deleteManyUsers();

    // seed the database with some dummy data (to test login, queries, deletes and updates)
    // hashing passwors since we are accessing the Prisma API directly
    const user = await prisma.mutation.createUser({
        data: {
            name: 'Alejandro Rodarte',
            email: 'alex@gmail.com',
            password: bcrypt.hashSync('jesus')
        }
    });

    // first dummy post for the first user
    await prisma.mutation.createPost({
        data: {
            title: 'Post 1 by Alejandro.',
            body: 'This is my first post.',
            published: true,
            author: {
                connect: {
                    id: user.id
                }
            }
        }
    });

    // second dummy post for the first user
    await prisma.mutation.createPost({
        data: {
            title: 'Post 2 by Alejandro.',
            body: 'This is my second post.',
            published: false,
            author: {
                connect: {
                    id: user.id
                }
            }
        }
    });

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