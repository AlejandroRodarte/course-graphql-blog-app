import getUserId from '../utils/getUserId';

// since prisma-binding methods support for relational data selection through the 'info' object argument
// there is no need to declare by ourselves the resolvers
const User = {

    // email field resolver
    email(parent, args, { prisma, request }, info) {

        // get user id or null
        const userId = getUserId(request, false);

        // check if user exists or if user matches the id provided through the parent (selection set)
        // return parent email if true, else null
        if (userId && userId === parent.id) {
            return parent.email;
        } else {
            return null;
        }

    }

};

export { User as default };