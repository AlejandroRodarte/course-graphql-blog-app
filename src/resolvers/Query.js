const Query = {

    // the 'users' query resolver
    // from the context, get the prisma-binding object and query for the users from the database
    // the 'info' argument contains the original operation incoming from the client, so we pass it as the selection set
    // as an object (also allowed besides the string format)
    // we can return promises in the resolver methods
    users(parent, args, { db, prisma }, info) {

        const opArgs = {};

        // if a query exists
        if (args.query) {

            // set a 'where' property and check if either the query matches any name or email on the records
            // all this syntax knowledge is provided by the Prisma API through its auto-generated documentation
            opArgs.where = {
                OR: [
                    {
                        name_contains: args.query
                    },
                    {
                        email_contains: args.query
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

        const opArgs = {};

        // if query is present: set a where property and check if search string
        // matches either the post title or body for all records (for more info, check the Prisma API docs!)
        if (args.query) {
            opArgs.where = {
                OR: [
                    {
                        title_contains: args.query
                    },
                    {
                        body_contains: args.query
                    }
                ]
            }
        }

        return prisma.query.posts(opArgs, info);

    },

    // the 'comments' query resolver: return all comments (part 1)
    comments(parent, args, { db }, info) {
        return db.comments;
    },

    me() {
        return {
            id: '123890',
            name: 'Alejandro',
            email: 'alejandrorodarte1@gmail.com',
            age: 15
        };
    },

    post() {
        return {
            id: 'abcxyz',
            title: 'My Post Title',
            body: 'My Post Description',
            published: false
        };
    }

};

export { Query as default };