import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import getUserId from '../utils/getUserId';

// our mutation handlers (resolvers)
const Mutation = {

    // create a new user
    async createUser(parent, args, { db, prisma }, info) {

        // validate password: must be 8+ characters long
        if (args.data.password.length < 8) {
            throw new Error('Password must be of 8 characters minimum.');
        }

        // hashing the password with bcryptjs
        const password = await bcrypt.hash(args.data.password, 10);

        // return promised user after creating, passing info as selection set from client
        // overwriting the original password field with the hashed password
        // removed the 'info' selection set so prisma-binding returns just scalar fields related to the user
        const user = await prisma.mutation.createUser({ 
            data: {
                ...args.data,
                password
            }
        });

        // return the created user and its auth token
        return {
            user,
            token: jwt.sign({ userId: user.id }, 'my-super-secret')
        };

    },

    // create a post
    createPost(parent, args, { db, pubsub, prisma, request }, info) {

        // get the decoded user id from the auth token
        const userId = getUserId(request);

        // create a post: spread the args.data key/value pairs but override the 'author' one
        // to match the Prisma API needs; set it to the decoded user id
        return prisma.mutation.createPost({
            data: {
                ...args.data,
                author: {
                    connect: {
                        id: userId
                    }
                }
            }
        }, info);

    },

    // create a new comment
    async createComment(parent, args, { db, pubsub, prisma, request }, info) {

        // get id of logged in user
        const userId = getUserId(request);

        // get the post by id and check if its published
        const post = await prisma.exists.Post({
            id: args.data.post,
            published: true
        });

        // post not fetched: means post we wanted to comment one is unpublished: throw error
        if (!post) {
            throw new Error('Can not comment on private posts.');
        }

        // call the correct mutation method, search for the Prisma API docs to pass the
        // correct operation arguments format
        return prisma.mutation.createComment({
            data: {
                text: args.data.text,
                author: {
                    connect: {
                        id: userId
                    }
                },
                post: {
                    connect: {
                        id: args.data.post
                    }
                }
            }
        }, info);

    },

    // delete a user by id (and all its posts and comments)
    async deleteUser(parent, args, { db, prisma, request }, info) {

        // get logged in user id
        const userId = getUserId(request);

        // return deleted user promise, read Prisma API docs to know how to structure
        // the operation arguments object
        // note: cascade deleting was already configured when configuring the Prisma datamode.graphql file
        // with the @relation directive

        // delete the logged in user by its id
        return prisma.mutation.deleteUser({
            where: {
                id: userId
            }
        }, info);

    },

    // delete a post by id
    async deletePost(parent, args, { db, pubsub, prisma, request }, info) {

        // get decoded id of logged in user
        const userId = getUserId(request);

        // check if the logged in user is attempting to delete a post he/she wrote
        const postExists = await prisma.exists.Post({
            id: args.id,
            author: {
                id: userId
            }
        });

        // not authorized: throw error
        if (!postExists) {
            throw new Error('Permission to delete denied.');
        }

        // call the correct mutation method
        return prisma.mutation.deletePost({
            where: {
                id: args.id
            }
        }, info);

    },

    // delete comment by id
    async deleteComment(parent, args, { db, pubsub, prisma, request }, info) {

        // get logged in user id
        const userId = getUserId(request);

        // find comment that the user made
        const commentExists = await prisma.exists.Comment({
            id: args.id,
            author: {
                id: userId
            }
        });

        // comment not found: throw error
        if (!commentExists) {
            throw new Error('Permission to delete denied');
        }

        // call the correct mutation method
        return prisma.mutation.deleteComment({
            where: {
                id: args.id
            }
        }, info);

    },

    // update user by id
    async updateUser(parent, args, { db, prisma, request }, info) {

        // get the decoded user id through the auth token inside the request
        const userId = getUserId(request);

        // make the call to the correct prisma method; update the logged in user data
        return prisma.mutation.updateUser({ 
            data: args.data,
            where: {
                id: userId
            }
        }, info);

    },

    // update post
    async updatePost(parent, args, { db, pubsub, prisma, request }, info) {

        // get logged in user id
        const userId = getUserId(request);

        // check if post was one that the user created
        const postExists = await prisma.exists.Post({
            id: args.id,
            author: {
                id: userId
            }
        });

        // post does not exist: throw error
        if (!postExists) {
            throw new Error('Permission to update denied.');
        }

        // check if the selected post is published or not
        const isPostPublished = await prisma.exists.Post({
            id: args.id,
            author: {
                id: userId
            },
            published: true
        });

        // check if the post was published and client pretends to unpublish it
        if (isPostPublished && !args.data.published) {

            // delete all comments that were associated to that unpublished post
            await prisma.mutation.deleteManyComments({
                where: {
                    post: {
                        id: args.id
                    }
                }
            });

        }

        // call the correct mutation method
        return prisma.mutation.updatePost({
            data: args.data,
            where: {
                id: args.id
            }
        }, info);

    },

    // update a comment
    async updateComment(parent, args, { db, pubsub, prisma, request }, info) {

        // get logged in user id
        const userId = getUserId(request);

        // find comment written by user
        const commentExists = await prisma.exists.Comment({
            id: args.id,
            author: {
                id: userId
            }
        });

        // comment does not exist: throw error
        if (!commentExists) {
            throw new Error('Permission to delete denied');
        }

        // call the correct mutation method
        return prisma.mutation.updateComment({
            data: args.data,
            where: {
                id: args.id
            }
        }, info);

    },

    // the login mutation
    async login(parent, { data }, { prisma }, info) {

        // deconstruct email and password
        const { email, password } = data;

        // query for user based on email (no info arg to return only scalar fields)
        const user = await prisma.query.user({
            where: {
                email
            }
        });

        // user not found: throw error
        if (!user) {
            throw new Error('Authentication failed.');
        }

        // check for matching passwords
        const isMatch = await bcrypt.compare(password, user.password);

        // passwords do not match: throw error
        if (!isMatch) {
            throw new Error('Authentication failed.');
        }

        // return found user info and a token for that user
        return {
            user,
            token: jwt.sign({ userId: user.id }, 'my-super-secret')
        }

    }

};

export { Mutation as default };