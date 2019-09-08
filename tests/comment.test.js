// Babel 7 imports for async/await support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'cross-fetch/polyfill';

import prisma from '../src/prisma';
import seedDatabase, { userOne, userTwo, postOne, commentTwo, commentOne } from './utils/seedDatabase';
import getClient from './utils/getClient';

// import our graphql queries
import { deleteComment, subscribeToComments } from './utils/operations';
import { JestEnvironment } from '@jest/environment';

// enabling apollo boost to make GraphQL queries
// get the client instance from the utility method
const client = getClient();

// lifecycle method: runs before each unit test runs; seed the database
beforeEach(async () => {
    await seedDatabase();
    jest.setTimeout(20000);
});

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
    client.subscribe({
        query: subscribeToComments,
        variables
    }).subscribe({
        next(response) {
            expect(response.data.comment.mutation).toBe('DELETED');
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