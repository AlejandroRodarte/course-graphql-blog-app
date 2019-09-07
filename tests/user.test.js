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

    jest.setTimeout(10000);

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

// test: get users
test('Should expose public author profiles.', async () => {

    jest.setTimeout(10000);

    // graphql query
    const getUsers = gql`
        query {
            users {
                id
                name
                email
            }
        }
    `;

    // use apollo to fire the request
    const response = await client.query({ query: getUsers });

    // check we get one user back, check that the returned email is actually hidden (null)
    // and that the name matches the one we hardcoded
    expect(response.data.users.length).toBe(1);
    expect(response.data.users[0].email).toBeNull();
    expect(response.data.users[0].name).toBe('Alejandro Rodarte');

});

// test: 'posts' query; get public posts
test('Should expose only public posts.', async () => {

    jest.setTimeout(10000);

    // graphql query
    const getPosts = gql`
        query {
            posts {
                id
                title
                body
                published
            }
        }
    `;

    // use apollo to make the request
    const response = await client.query({ query: getPosts });

    // expect two things: out of the two posts, we should be getting just one
    // also, check that the post that came back is actually one that is published
    expect(response.data.posts.length).toBe(1);
    expect(response.data.posts[0].published).toBe(true);

});

// expecting an error
test('Should not login with bad credentials.', async () => {
    
    jest.setTimeout(10000);

    // graphql query
    const login = gql`
        mutation {
            login(
                data: {
                    email: "alex@gmail.com",
                    password: "jesus2"
                }
            ) {
                token
            }
        }
    `;

    // we can place a promise inside expect and use .rejects so expect() can wait
    // for the promise to reject with an error; validate with toThrow()
    await expect(client.mutate({ mutation: login })).rejects.toThrow();

});

// di not signup with short password
test('Should not signup with a password that is not 8+ characters long.', async () => {

    jest.setTimeout(10000);

    // graphql query
    const signup = gql`
        mutation {
            createUser(
                data: {
                    name: "Patricia Mendoza",
                    email: "paty@gmail.com",
                    password: "paty"
                }
            ) {
                user {
                    id
                    name
                }
                token
            }
        }
    `;

    // wait for an error to appear after the mutation promise gets rejected
    await expect(client.mutate({ mutation: signup })).rejects.toThrow();

});