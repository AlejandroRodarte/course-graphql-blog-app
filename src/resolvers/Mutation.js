import uuidv4 from 'uuid';

// our mutation handlers (resolvers)
const Mutation = {

    // create a new user
    async createUser(parent, args, { db, prisma }, info) {
        // return promised user after creating, passing info as selection set from client
        return prisma.mutation.createUser({ data: args.data }, info);
    },

    // create a post
    createPost(parent, args, { db, pubsub, prisma }, info) {

        // create a post: spread the args.data key/value pairs but override the 'author' one
        // to match the Prisma API needs
        return prisma.mutation.createPost({
            data: {
                ...args.data,
                author: {
                    connect: {
                        id: args.data.author
                    }
                }
            }
        }, info);

    },

    // create a new comment
    createComment(parent, args, { db, pubsub }, info) {

        // check if user exists
        const userExists = db.users.some(user => user.id === args.data.author);

        // user does not exist: throw error
        if (!userExists) {
            throw new Error('Attempted to add a new comment to a non-existent user.')
        }

        // check if post exists and is published
        const postAvailable = db.posts.some(post => (post.id === args.data.post) && (post.published === true));

        // post does not exist or is not published: throw error
        if (!postAvailable) {
            throw new Error('Attempted to add a new comment to a non-existent or unpublished post.');
        }

        // create new comment
        const comment = {
            id: uuidv4(),
            ...args.data
        };

        // add the new comment
        db.comments.push(comment);

        // publish the new comment object on the channel that belong to a particular post id
        // example: subscribe to post 12; channel name: 'comment 12'
        // when a comment in post 12 is made, we publish the comment to channel 'comment 12'
        // now inform about the mutation operation (this comment was created)
        pubsub.publish(`comment ${args.data.post}`, { 
            comment: {
                mutation: 'CREATED',
                data: comment
            }
        });

        // response
        return comment;

    },

    // delete a user by id (and all its posts and comments)
    async deleteUser(parent, args, { db, prisma }, info) {

        // return deleted user promise, read Prisma API docs to know how to structure
        // the operation arguments object
        // note: cascade deleting was already configured when configuring the Prisma datamode.graphql file
        // with the @relation directive
        return prisma.mutation.deleteUser({
            where: {
                id: args.id
            }
        }, info);

    },

    // delete a post by id
    deletePost(parent, args, { db, pubsub }, info) {

        // search for the post
        const postIndex = db.posts.findIndex(post => post.id === args.id);

        // post not found: throw error
        if (postIndex === -1) {
            throw new Error('Attempted to delete a non-existent post.');
        }
        
        // delete and get deleted post (array destructuring)
        const [post] = db.posts.splice(postIndex, 1);

        // filter our comments that were not related to that post
        db.comments = db.comments.filter(comment => comment.post !== args.id);

        // if the deleted post was published, publish the post providing information
        // about the mutation type (the post was deleted)
        if (post.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'DELETED',
                    data: post
                }
            });
        }

        // return deleted post
        return post;

    },

    // delete comment by id
    deleteComment(parent, args, { db, pubsub }, info) {

        // search for the comment
        const commentIndex = db.comments.findIndex(comment => comment.id === args.id);

        // comment not found; throw error
        if (commentIndex === -1) {
            throw new Error('Attempted to delete a non-existent comment.');
        }

        // delete the comment and get it back
        const [comment] = db.comments.splice(commentIndex, 1);

        // use the deleted comment's post id to inform through the correct channel
        // the deleted comment content and the mutation operation (this comment was deleted)
        pubsub.publish(`comment ${comment.post}`, {
            comment: {
                mutation: 'DELETED',
                data: comment
            }
        });

        // return the deleted comment
        return comment;

    },

    // update user by id
    async updateUser(parent, args, { db, prisma }, info) {

        // make the call to the correct prisma method
        return prisma.mutation.updateUser({ 
            data: args.data,
            where: {
                id: args.id
            }
        }, info);

    },

    // update post
    updatePost(parent, args, { db, pubsub }, info) {

        const { id, data } = args;

        // find post
        const post = db.posts.find(post => post.id === id);

        // a copy of the original post
        const originalPost = { ...post };

        // not found: throw error
        if (!post) {
            throw new Error('Attempted to update a non-existend post.');
        }

        // title input is a string
        if (typeof data.title === 'string') {
            post.title = data.title;
        }

        // body input is a string
        if (typeof data.body === 'string') {
            post.body = data.body;
        }

        // published is a boolean
        if (typeof data.published === 'boolean') {

            post.published = data.published;

            let mutation = '';
            let finalPost;

            if (originalPost.published && !post.published) {

                // first scenario: post was originally published and it was edited to
                // be unpublished: mark the original post as deleted
                mutation = 'DELETED';
                finalPost = originalPost;

            } else if (!originalPost.published && post.published) {

                // second scenario: post was originally unpublihsed and it was edited to
                // be published: mark the new post as created
                mutation = 'CREATED';
                finalPost = post;

            } else if (post.published) {

                // third scenario: the post was mantained as published: mark the updated post
                // as updated
                mutation = 'UPDATED'
                finalPost = post;

            }

            // publish the final mutation and post value from the if-else statement
            pubsub.publish('post', {
                post: {
                    mutation,
                    data: finalPost
                }
            });

        }

        // return updated post
        return post;

    },

    // update a comment
    updateComment(parent, args, { db, pubsub }, info) {

        const { id, data } = args;

        // find comment
        const comment = db.comments.find(comment => comment.id === id);

        // not found: throw error
        if (!comment) {
            throw new Error('Attempted to update a non-existent comment.');
        }

        // text input is a string
        if (typeof data.text === 'string') {
            comment.text = data.text;
        }

        // inform through the correct channel about the updated comment and the
        // mutation operation (this comment was updated)
        pubsub.publish(`comment ${comment.post}`, {
            comment: {
                mutation: 'UPDATED',
                data: comment
            }
        });

        return comment;

    }

};

export { Mutation as default };