// Babel 7 imports for async/await support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import { gql } from 'apollo-boost';
import prisma from '../src/prisma';
import seedDatabase, { userOne } from './utils/seedDatabase';
import getClient from './utils/getClient';

// enabling apollo boost to make GraphQL queries
// get the client instance from the utility method
const client = getClient();

// lifecycle method: runs before each unit test runs; seed the database
beforeEach(seedDatabase);

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

// fetch user profile
test('Should fetch user profile.', async () => {

    // use a new authenticated apollo client
    const client = getClient(userOne.jwt);

    // graphql query
    const getProfile = gql`
        query {
            me {
                id
                name
                email
            }
        }
    `;

    // kickoff the request
    const { data } = await client.query({ query: getProfile });

    // validate the data we got back matches the hardcoded one
    expect(data.me.id).toBe(userOne.user.id);
    expect(data.me.name).toBe(userOne.user.name);
    expect(data.me.email).toBe(userOne.user.email);

});