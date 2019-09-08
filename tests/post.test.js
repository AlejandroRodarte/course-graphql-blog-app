// Babel 7 imports for async/await support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import seedDatabase, { userOne, postOne, postTwo } from './utils/seedDatabase';
import getClient from './utils/getClient';
import prisma from '../src/prisma';

// import the graphql operations we use in this test suite
import { getPosts, getMyPosts, updatePost, createPost, deletePost } from './utils/operations';

// enabling apollo boost to make GraphQL queries
// get the client from the utility method
const client = getClient();

// seed the database before each unit test runs
beforeEach(seedDatabase);

// test: 'posts' query; get public posts
test('Should expose only public posts.', async () => {

    // use apollo to make the request
    const response = await client.query({ query: getPosts });

    // expect two things: out of the two posts, we should be getting just one
    // also, check that the post that came back is actually one that is published
    expect(response.data.posts.length).toBe(1);
    expect(response.data.posts[0].published).toBe(true);

}, 10000);

// get posts from authenticated user
test('Should get posts from authenticated user.', async () => {

    // override client, get a new one with an auth token in the header
    const client = getClient(userOne.jwt);

    // fire off request
    const { data } = await client.query({ query: getMyPosts });

    // expect that the received response matches the hardcoded information
    expect(data.myPosts.length).toBe(2);
    expect(data.myPosts[0].title).toBe('Post 1 by Alejandro.');
    expect(data.myPosts[0].published).toBe(true);
    expect(data.myPosts[1].title).toBe('Post 2 by Alejandro.');
    expect(data.myPosts[1].published).toBe(false);

}, 10000);

// test updating posts
test('Should be able to update own post.', async () => {

    // get authenticated client
    const client = getClient(userOne.jwt);

    // variables to pass in to the updatePost mutation
    const variables = {
        id: `${postOne.post.id}`,
        data: {
            published: false
        }
    };

    // use the client to kickstart the actual mutation
    // pass in the required graphql variables
    const { data } = await client.mutate({ 
        mutation: updatePost,
        variables
    });

    // expect that the received post has the `published` flag properly updated
    expect(data.updatePost.published).toBe(false);

    // use prisma-binding to find in the database the post with the updated information
    const isPostUpdated = await prisma.exists.Post({
        id: postOne.post.id,
        published: false
    });
    
    // expect that we actually found the updated post in the database
    expect(isPostUpdated).toBe(true);

}, 10000);

// testing post creation
test('Should create a post with an authenticated user.', async () => {

    // get authenticated user
    const client = getClient(userOne.jwt);

    // variables required for the updateUser mutation
    const variables = {
        data: {
            title: 'Post by Alex 3.',
            body: 'This is the post body.',
            published: true
        }
    };

    // fire off the mutation and get the data
    // pass in the required variables
    const { data } = await client.mutate({ 
        mutation: createPost,
        variables
    });

    // expect the data we got back as a response matches the one we hardcoded
    expect(data.createPost.title).toBe('Post by Alex 3.');
    expect(data.createPost.body).toBe('This is the post body.');
    expect(data.createPost.published).toBe(true);

    // use prisma-binding to check the post was persisted to the database
    const postExists = await prisma.exists.Post({
        id: data.createPost.id
    });

    expect(postExists).toBe(true);

}, 10000);

// testing deletion of posts of authenticated users
test('Should delete post that pertains to authenticated user that created that post.', async () => {

    // get authenticated client
    const client = getClient(userOne.jwt);

    // variables required for the deletePost operation
    const variables = {
        id: `${postTwo.post.id}`
    };

    // fire off the request
    // pass in the required variables
    const { data } = await client.mutate({ 
        mutation: deletePost,
        variables
    });

    // check the data we got back matches the one we got when persisting to the database through Prisma API
    expect(data.deletePost.id).toBe(postTwo.post.id);
    expect(data.deletePost.title).toBe(postTwo.post.title);
    expect(data.deletePost.body).toBe(postTwo.post.body);
    expect(data.deletePost.published).toBe(postTwo.post.published);

    // check that the post does not exist in the database
    const postExists = await prisma.exists.Post({
        id: postTwo.post.id
    });

    expect(postExists).toBe(false);

}, 10000);