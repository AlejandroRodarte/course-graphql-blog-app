// Babel 7 imports for async/await support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import { gql } from 'apollo-boost';
import seedDatabase from './utils/seedDatabase';
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