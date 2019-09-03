// resolver when accessing a User given a Post: get User by matching its primary key (id)
// with the Post's author foreign key (owner, parent)
const Post = {

    author(parent, args, { db }, info) {
        return db.users.find(user => user.id === parent.author); 
    },

    // resolver when accessing Comments given a particular Post, get Comments where its 'post' foreign key
    // match the parent's (post) primary key id
    comments(parent, args, { db }, info) {
        return db.comments.filter(comment => comment.post === parent.id);
    }

};

export { Post as default };