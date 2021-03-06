import getUserId from '../utils/getUserId';

const Query = {

    // the 'users' query resolver
    // from the context, get the prisma-binding object and query for the users from the database
    // the 'info' argument contains the original operation incoming from the client, so we pass it as the selection set
    // as an object (also allowed besides the string format)
    // we can return promises in the resolver methods
    users(parent, args, { db, prisma }, info) {

        // set basic pagination with first and skip arguments
        // also setting sorting
        const opArgs = {
            first: args.first,
            skip: args.skip,
            after: args.after,
            orderBy: args.orderBy
        };

        // if a query exists
        if (args.query) {

            // set a 'where' property and check if either the query matches any name on the records
            // all this syntax knowledge is provided by the Prisma API through its auto-generated documentation
            opArgs.where = {
                OR: [
                    {
                        name_contains: args.query
                    }
                ]
            }

        }

        // return users according to operation arguments and the selection set the client wants
        return prisma.query.users(opArgs, info);

    },

    // the 'posts' query resolver
    // use prisma-binding to query for all psots in the database
    posts(parent, args, { db, prisma }, info) {

        // fetch only posts that have been published
        // set up pagination and sorting
        const opArgs = {
            where: {
                published: true
            },
            first: args.first,
            skip: args.skip,
            after: args.after,
            orderBy: args.orderBy
        };

        // if query is present: set a where property and check if search string
        // matches either the post title or body for all records (for more info, check the Prisma API docs!)
        if (args.query) {
            opArgs.where.OR = [
                {
                    title_contains: args.query
                },
                {
                    body_contains: args.query
                }
            ]
        }

        return prisma.query.posts(opArgs, info);

    },

    // the 'comments' query resolver: return all comments from the database with prisma
    comments(parent, args, { db, prisma }, info) {

        // apply filtering parameters and sorting
        const opArgs = {
            first: args.first,
            skip: args.skip,
            after: args.after,
            orderBy: args.orderBy
        };

        // get comments according to filter criteria and selection set
        return prisma.query.comments(opArgs, info);

    },

    // get logged in user information
    async me(parent, args, { prisma, request }, info) {

        // get logged in user id
        const userId = getUserId(request);

        // find logged in user by id
        const user = await prisma.query.user({
            where: {
                id: userId
            }
        });

        // return the user
        return user;

    },

    // get public posts
    async post(parent, args, { prisma, request }, info) {

        // get user id with authentication not required (false)
        // this function will attempt to find the authorization header
        // and if it does not find it, instead of throwing an error it will return null
        const userId = getUserId(request, false);

        // using 'posts' query since it has more querying options than the 'post' query
        // find post by id (just one) and check if that only post is either published or is one
        // created by the logged in user

        // if the value at this point for userId is 'null' (we do not have a logged in user), 
        // prisma will make false this 'author' search criteria, making the 'published' criteria the only possible to one
        // to make the OR condition true
        const posts = await prisma.query.posts({
            where: {
                id: args.id,
                OR: [
                    {
                        published: true
                    },
                    {
                        author: {
                            id: userId
                        }
                    }
                ]
            }
        }, info);

        // check if we did not find a post: throw error
        if (posts.length === 0) {
            throw new Error('Post not found.');
        }

        // return the only post we found
        return posts[0];

    },

    // get private posts
    myPosts(parent, args, { prisma, request }, info) {

        // get user id through auth token
        const userId = getUserId(request);

        // set operation argument: posts that are made by the particular logged in user
        // also set filtering arguments and sorting
        const opArgs = {
            where: {
                author: {
                    id: userId
                }
            },
            first: args.first,
            skip: args.skip,
            after: args.after,
            orderBy: args.orderBy
        };

        // add additional search criteria if the optional query is provided 
        if (args.query) {
            opArgs.where.OR = [
                {
                    title_contains: args.query
                },
                {
                    body_contains: args.query
                }
            ]
        }

        // return posts that match the operation arguments
        return prisma.query.posts(opArgs, info);

    }

};

export { Query as default };