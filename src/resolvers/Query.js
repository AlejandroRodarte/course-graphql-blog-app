const Query = {

    // the 'users' query resolver
    // from the context, get the prisma-binding object and query for the users from the database
    // the 'info' argument contains the original operation incoming from the client, so we pass it as the selection set
    // as an object (also allowed besides the string format)
    // we can return promises in the resolver methods
    users(parent, args, { db, prisma }, info) {
        return prisma.query.users(null, info);
    },

    // the 'posts' query resolver
    // use prisma-binding to query for all psots in the database
    posts(parent, args, { db, prisma }, info) {
        return prisma.query.posts(null, info);
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