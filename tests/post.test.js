// Babel 7 imports for async/await support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import { gql } from 'apollo-boost';
import seedDatabase, { userOne } from './utils/seedDatabase';
import getClient from './utils/getClient';

// enabling apollo boost to make GraphQL queries
// get the client from the utility method
const client = getClient();

// seed the database before each unit test runs
beforeEach(seedDatabase);

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

// get posts from authenticated user
test('Should get posts from authenticated user.', async () => {

    // override client, get a new one with an auth token in the header
    const client = getClient(userOne.jwt);

    // graphql query
    const getMyPosts = gql`
        query {
            myPosts {
                id
                title
                body
                published
            }
        }
    `;

    // fire off request
    const { data } = await client.query({ query: getMyPosts });

    // expect that the received response matches the hardcoded information
    expect(data.myPosts.length).toBe(2);
    expect(data.myPosts[0].title).toBe('Post 1 by Alejandro.');
    expect(data.myPosts[0].published).toBe(true);
    expect(data.myPosts[1].title).toBe('Post 2 by Alejandro.');
    expect(data.myPosts[1].published).toBe(false);

});