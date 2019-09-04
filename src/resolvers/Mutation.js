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
    createComment(parent, args, { db, pubsub, prisma }, info) {

        // call the correct mutation method, search for the Prisma API docs to pass the
        // correct operation arguments format
        return prisma.mutation.createComment({
            data: {
                text: args.data.text,
                author: {
                    connect: {
                        id: args.data.author
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
    deletePost(parent, args, { db, pubsub, prisma }, info) {

        // call the correct mutation method
        return prisma.mutation.deletePost({
            where: {
                id: args.id
            }
        }, info);

    },

    // delete comment by id
    deleteComment(parent, args, { db, pubsub, prisma }, info) {

        // call the correct mutation method
        return prisma.mutation.deleteComment({
            where: {
                id: args.id
            }
        }, info);

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
    updatePost(parent, args, { db, pubsub, prisma }, info) {

        // call the correct mutation method
        return prisma.mutation.updatePost({
            data: args.data,
            where: {
                id: args.id
            }
        }, info);

    },

    // update a comment
    updateComment(parent, args, { db, pubsub, prisma }, info) {

        // call the correct mutation method
        return prisma.mutation.updateComment({
            data: args.data,
            where: {
                id: args.id
            }
        }, info);

    }

};

export { Mutation as default };