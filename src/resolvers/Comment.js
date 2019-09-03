// resolver when accessing User given a Comment: find User that matches its primary key (id) with the comments id (parent)
const Comment = {

    author(parent, args, { db }, info) {
        return db.users.find(user => user.id === parent.author);
    },

    // resolver when accessing a Post given a Comment, search for the post where its primary key (id) matches the parent 'post'
    // foreign key (Comment)
    post(parent, args, { db }, info) {
        return db.posts.find(post => post.id === parent.post);
    }

};

export { Comment as default };