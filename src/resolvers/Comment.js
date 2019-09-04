// resolver when accessing User given a Comment: find User that matches its primary key (id) with the comments id (parent)

// since prisma-binding methods support for relational data selection through the 'info' object argument
// there is no need to declare by ourselves the resolvers
const Comment = {

};

export { Comment as default };