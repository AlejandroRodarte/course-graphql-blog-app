// resolver when accessing Posts given a User, get all Posts that match their foreign key with the
// user's id (parent)
const User = {

    posts(parent, args, { db }, info) {
        return db.posts.filter(post => parent.id === post.author);
    },

    // resolver when accessing Comments given a User, get all Comments that match the User primary key (id, parent)
    // with the Comment foreign key (owner, user id)
    comments(parent, args, { db }, info) {
        return db.comments.filter(comment => parent.id === comment.author);
    }

};

export { User as default };