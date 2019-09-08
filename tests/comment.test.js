// Babel 7 imports for async/await support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import prisma from '../src/prisma';
import seedDatabase, { userOne, userTwo, postOne, postTwo, commentTwo, commentOne } from './utils/seedDatabase';
import getClient from './utils/getClient';

// import our graphql queries
import { getComments, createComment, deleteComment, subscribeToComments, updateComment } from './utils/operations';

// enabling apollo boost to make GraphQL queries
// get the client instance from the utility method
const client = getClient();

// lifecycle method: runs before each unit test runs; seed the database
beforeEach(seedDatabase);

// testing deleting comments that a user is authorized two
test('Should delete own comment.', async () => {

    // get apollo client with auth token from user one (created comment two)
    const client = getClient(userOne.jwt);

    // variable $id for comment two
    const variables = {
        id: commentTwo.comment.id
    };

    // kickstart the deleteComment query with its variables
    const { data } = await client.mutate({
        mutation: deleteComment,
        variables
    });

    // expect the response we get matches the response we got when the data
    // got originally persisted
    expect(data.deleteComment.id).toBe(commentTwo.comment.id);
    expect(data.deleteComment.text).toBe(commentTwo.comment.text);

    // check if the comment was properly deleted in the database (should not exist)
    const commentExists = await prisma.exists.Comment({
        id: commentTwo.comment.id
    });

    expect(commentExists).toBe(false);

});

// test case where user should not be able to delete a comment it does now own
test('Should not delete other users comment.', async () => {

    // get client with auth token of user two (created comment one)
    const client = getClient(userTwo.jwt);

    // variables with id of comment two
    const variables = {
        id: commentTwo.comment.id
    };

    // kickstart the delete comment operation
    // should fail since user two did NOT create comment two
    await expect(client.mutate({
        mutation: deleteComment,
        variables
    })).rejects.toThrow();

});

// testing subscriptions to comments for a post
test('Should subscribe to comments for a post.', async (done) => {

    // variable: the post id to monitor
    const variables = {
        postId: postOne.post.id
    };

    // client.subscribe does not return a promise, but an observable
    // this is why we subscribe() to it; each time a change is detected, 
    // the next() function is called with the response object carried on
    // on this case, we check if the mutation type detected as a 'DELETED' one

    // since we are working with observables, we need to wait for the response to arrive
    // before the unit test code ends; this is why we use the done() callback

    // be sure to unsubscribe when next gets called to avoid conflicts with other tests
    const subscription = 
        client.subscribe({
            query: subscribeToComments,
            variables
        }).subscribe({
            next(response) {
                expect(response.data.comment.mutation).toBe('DELETED');
                subscription.unsubscribe();
                done();
            }
        });

    // delete a comment, the next() function above should trigger with
    // the response object passed in
    await prisma.mutation.deleteComment({
        where: {
            id: commentOne.comment.id
        }
    });

});

test('Should fetch post comments.', async () => {

    const variables = {
        id: postOne.post.id
    };

    const { data } = await client.query({
        query: getComments,
        variables
    });
    
    expect(data.post.comments.length).toBe(2);

    expect(data.post.comments[0].id).toBe(commentOne.comment.id);
    expect(data.post.comments[0].text).toBe(commentOne.comment.text);

    expect(data.post.comments[1].id).toBe(commentTwo.comment.id);
    expect(data.post.comments[1].text).toBe(commentTwo.comment.text);

});

test('Should create a new comment.', async () => {

    const client = getClient(userTwo.jwt);

    const variables = {
        data: {
            text: 'This is pretty good!',
            post: postOne.post.id
        }
    };

    const { data } = await client.mutate({
        mutation: createComment,
        variables
    });

    expect(data.createComment.text).toBe('This is pretty good!');

    expect(data.createComment.author.id).toBe(userTwo.user.id);
    expect(data.createComment.post.id).toBe(postOne.post.id);

    const commentExists = await prisma.exists.Comment({
        id: data.createComment.id
    });

    expect(commentExists).toBe(true);

});

test('Should not create comment on draft post.', async () => {

    const client = getClient(userTwo.jwt);

    const variables = {
        data: {
            text: 'This is pretty good!',
            post: postTwo.post.id
        }
    };

    await expect(
        client.mutate({
            mutation: createComment,
            variables
        })
    ).rejects.toThrow();

});

test('Should update comment.', async () => {

    const client = getClient(userOne.jwt);

    const variables = {
        id: commentTwo.comment.id,
        data: {
            text: 'I changed my comment!'
        }
    };

    const { data } = await client.mutate({
        mutation: updateComment,
        variables
    });

    expect(data.updateComment.text).toBe('I changed my comment!');

    const commentExists = await prisma.exists.Comment({
        id: data.updateComment.id,
        text: data.updateComment.text
    });

    expect(commentExists).toBe(true);

});

test('Should not update another users comment.', async () => {

    const client = getClient(userOne.jwt);

    const variables = {
        id: commentOne.comment.id,
        data: {
            text: 'I changed this comment!'
        }
    };

    await expect(
        client.mutate({
            mutation: updateComment,
            variables
        })
    ).rejects.toThrow();

    const commentExists = await prisma.exists.Comment({
        id: commentOne.comment.id,
        text: 'I changed this comment!'
    });

    expect(commentExists).toBe(false);

});

test('Should not delete another users comment.', async () => {

    const client = getClient(userTwo.jwt);

    const variables = {
        id: commentTwo.comment.id,
    };

    await expect(
        client.mutate({
            mutation: deleteComment,
            variables
        })
    ).rejects.toThrow();

    const commentExists = await prisma.exists.Comment({
        id: commentTwo.comment.id
    });

    expect(commentExists).toBe(true);

});

test('Should require authentication to create a comment', async () => {

    const variables = {
        data: {
            text: 'I did not expect that.',
            post: postOne.post.id
        }
    };

    await expect(
        client.mutate({
            mutation: createComment,
            variables
        })
    ).rejects.toThrow();

});

test('Should require authentication to update a comment', async () => {

    const variables = {
        id: commentTwo.comment.id,
        data: {
            text: 'I changed my comment!'
        }
    };

    await expect(
        client.mutate({
            mutation: updateComment,
            variables
        })
    ).rejects.toThrow();

});

test('Should require authentication to delete a comment', async () => {

    const variables = {
        id: commentOne.comment.id,
    };

    await expect(
        client.mutate({
            mutation: deleteComment,
            variables
        })
    ).rejects.toThrow();

});