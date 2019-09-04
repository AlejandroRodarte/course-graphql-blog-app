// resolver when accessing Posts given a User, get all Posts that match their foreign key with the
// user's id (parent)

// since prisma-binding methods support for relational data selection through the 'info' object argument
// there is no need to declare by ourselves the resolvers
const User = {

};

export { User as default };