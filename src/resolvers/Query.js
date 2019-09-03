const Query = {

    // the 'users' query resolver
    users(parent, args, { db }, info) {

        // no query: return all users
        if (!args.query) {
            return db.users;
        }

        // query: search for matches of query string with the user name and return filtered array
        return db.users.filter(user => user.name.toLowerCase().includes(args.query.toLowerCase()));

    },

    // the 'posts' query resolver
    posts(parent, args, { db }, info) {

        // no query: return all posts
        if (!args.query) {
            return db.posts;
        }

        // query: return all posts that match the search query either in the post title or in the post body
        return db.posts.filter(post => {
            return post.title.toLowerCase().includes(args.query.toLowerCase()) || post.body.toLowerCase().includes(args.query.toLowerCase());
        });

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