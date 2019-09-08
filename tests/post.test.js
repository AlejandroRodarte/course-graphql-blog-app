// Babel 7 imports for async/await support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import seedDatabase, { userOne, userTwo, postOne, postTwo } from './utils/seedDatabase';
import getClient from './utils/getClient';
import prisma from '../src/prisma';

// import the graphql operations we use in this test suite
import { getPost, getPosts, getMyPosts, updatePost, createPost, deletePost, subscribeToPosts } from './utils/operations';

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

});

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

});

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

});

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

});

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

});

// testing subscriptions for changes in posts
test('Should subscribe to changes in a post.', async (done) => {

    // make the subscription and subscribe to wait for the response
    // where the mutation type should be DELETED
    // be sure to unsubscribe when next gets called to avoid conflicts with other tests
    const subscription = 
        client.subscribe({
            query: subscribeToPosts
        }).subscribe({
            next(response) {
                expect(response.data.post.mutation).toBe('DELETED');
                subscription.unsubscribe();
                done();
            }
        });

    // starting the deletePost mutation to trigger the next() call
    await prisma.mutation.deletePost({
        where: {
            id: postOne.post.id
        }
    });

});

test('Should not be able to update another users post.', async () => {

    const client = getClient(userTwo.jwt);

    const variables = {
        id: postOne.post.id,
        data: {
            title: 'Post title changed.'
        }
    };

    await expect(
        client.mutate({
            mutation: updatePost,
            variables
        })
    ).rejects.toThrow();

    const postExists = await prisma.exists.Post({
        id: postOne.post.id,
        title: postOne.post.title
    });

    expect(postExists).toBe(true);

});

test('Should not be able to delete another users post', async () => {

    const client = getClient(userTwo.jwt);

    const variables = {
        id: postOne.post.id
    };

    await expect(
        client.mutate({
            mutation: deletePost,
            variables
        })
    ).rejects.toThrow();

    const postExists = await prisma.exists.Post({
        id: postOne.post.id
    });

    expect(postExists).toBe(true);

});

test('Should require authentication to create a post.', async () => {

    const variables = {
        data: {
            title: 'Post by Paty.',
            body: 'Post body.',
            published: false
        }
    };

    await expect(
        client.mutate({
            mutation: createPost,
            variables
        })
    ).rejects.toThrow();

});

test('Should require authentication to update a post.', async () => {

    const variables = {
        id: postOne.post.id,
        data: {
            body: 'Post body changed.'
        }
    };

    await expect(
        client.mutate({
            mutation: updatePost,
            variables
        })
    ).rejects.toThrow();

});

test('Should require authentication to delete a post.', async () => {

    const variables = {
        id: postOne.post.id,
    };

    await expect(
        client.mutate({
            mutation: deletePost,
            variables
        })
    ).rejects.toThrow();

});

test('Should fetch published post by id.', async () => {

    const variables = {
        id: postOne.post.id
    };

    const { data } = await client.query({
        query: getPost,
        variables
    });

    expect(data.post.id).toBe(postOne.post.id);
    expect(data.post.title).toBe(postOne.post.title);
    expect(data.post.body).toBe(postOne.post.body);
    expect(data.post.published).toBe(postOne.post.published);

});

test('Should fetch own post by id.', async () => {

    const client = getClient(userOne.jwt);

    const variables = {
        id: postTwo.post.id
    };

    const { data } = await client.query({
        query: getPost,
        variables
    });

    expect(data.post.id).toBe(postTwo.post.id);
    expect(data.post.title).toBe(postTwo.post.title);
    expect(data.post.body).toBe(postTwo.post.body);
    expect(data.post.published).toBe(postTwo.post.published);

});

test('Should not fetch draft post from other user.', async () => {

    const client = getClient(userTwo.jwt);

    const variables = {
        id: postTwo.post.id
    };

    await expect(
        client.query({
            query: getPost,
            variables
        })
    ).rejects.toThrow();

});