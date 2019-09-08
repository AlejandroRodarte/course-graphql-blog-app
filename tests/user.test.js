// Babel 7 imports for async/await support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import jwt from 'jsonwebtoken';

import prisma from '../src/prisma';
import seedDatabase, { userOne, userTwo } from './utils/seedDatabase';
import getClient from './utils/getClient';

// import our graphql queries
import { createUser, getUsers, login, getProfile } from './utils/operations';

// enabling apollo boost to make GraphQL queries
// get the client instance from the utility method
const client = getClient();

// lifecycle method: runs before each unit test runs; seed the database
beforeEach(seedDatabase);

// test: create a user in the database
test('Should create a new user.', async () => {

    // variables for the createUser operation
    const variables = {
        data: {
            name: 'Magdaleno Rodriguez',
            email: 'max@gmail.com',
            password: 'guadalupana'
        }
    };

    // fire off the mutation; get the promised response data
    // pass in the variables required for this particular test case
    const response = await client.mutate({ 
        mutation: createUser,
        variables
    });

    // check if user was persisted properly to the database
    const userExists = await prisma.exists.User({
        id: response.data.createUser.user.id
    });

    // expect the promised boolean to be true
    expect(userExists).toBe(true);
    
});

// test: get users
test('Should expose public author profiles.', async () => {

    // use apollo to fire the request
    const response = await client.query({ query: getUsers });

    // check we get one user back, check that the returned email is actually hidden (null)
    // and that the name matches the one we hardcoded
    expect(response.data.users.length).toBe(2);
    expect(response.data.users[0].email).toBeNull();
    expect(response.data.users[0].name).toBe('Alejandro Rodarte');

});

// expecting an error
test('Should not login with bad credentials.', async () => {

    // variables required for the login operation
    const variables = {
        data: {
            email: 'alex@gmail.com',
            password: 'jesus2'
        }
    };

    // we can place a promise inside expect and use .rejects so expect() can wait
    // for the promise to reject with an error; validate with toThrow()
    // pass in the variables for the login operation
    await expect(client.mutate({ 
        mutation: login,
        variables
    })).rejects.toThrow();

});

// di not signup with short password
test('Should not signup with a password that is not 8+ characters long.', async () => {

    // variables for the createUser operation
    const variables = {
        data: {
            name: 'Patricia Mendoza',
            email: 'paty@gmail.com',
            password: 'paty'
        }
    };

    // wait for an error to appear after the mutation promise gets rejected
    // pass the variables for the createUser operation
    await expect(client.mutate({ 
        mutation: createUser,
        variables
    })).rejects.toThrow();

});

// fetch user profile
test('Should fetch user profile.', async () => {

    // use a new authenticated apollo client
    const client = getClient(userOne.jwt);

    // kickoff the request
    const { data } = await client.query({ query: getProfile });

    // validate the data we got back matches the hardcoded one
    expect(data.me.id).toBe(userOne.user.id);
    expect(data.me.name).toBe(userOne.user.name);
    expect(data.me.email).toBe(userOne.user.email);

});

test('Should not signup a user with email that is already in use.', async () => {

    const variables = {
        data: {
            name: 'Pepe Rodarte',
            email: 'alex@gmail.com',
            password: 'thatstheway'
        }
    };

    await expect(client.mutate({
        mutation: createUser,
        variables
    })).rejects.toThrow();

    const userExists = await prisma.exists.User({
        name: 'Pepe Rodarte',
        email: 'alex@gmail.com'
    });

    expect(userExists).toBe(false);

});

test('Should login and provide authentication token', async () => {

    const variables = {
        data: {
            email: 'paty@gmail.com',
            password: 'guadalupana'
        }
    };

    const { data } = await client.mutate({
        mutation: login,
        variables
    });

    const decoded = jwt.verify(data.login.token, process.env.JWT_SECRET);

    expect(decoded.userId).toBe(userTwo.user.id);

});

test('Should reject me query without authentication', async () => {
    await expect(client.query({ query: getProfile })).rejects.toThrow();
});

test('Should hide emails when fetching list of users.', async () => {

    const { data } = await client.query({ query: getUsers });

    data.users.forEach(user => {
        expect(user.email).toBeNull();
    });

});