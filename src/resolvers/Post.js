// resolver when accessing a User given a Post: get User by matching its primary key (id)
// with the Post's author foreign key (owner, parent)

// since prisma-binding methods support for relational data selection through the 'info' object argument
// there is no need to declare by ourselves the resolvers
const Post = {

};

export { Post as default };