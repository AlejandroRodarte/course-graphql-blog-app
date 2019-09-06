import getUserId from '../utils/getUserId';

// since prisma-binding methods support for relational data selection through the 'info' object argument
// there is no need to declare by ourselves the resolvers
const User = {

    // email object with a fragment and a resolver
    email: {

        // requesting prisma to fetch the user id even if the client did not specify it on the selection set
        fragment: 'fragment userId on User { id }',

        // the actual resolver
        resolve(parent, args, { prisma, request }, info) {

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

    },

    // password field resolver: only make available hashed password to logged in user
    // the other password should not be accessed
    password: {

        fragment: 'fragment userId on User { id }',

        resolve(parent, args, { prisma, request }, info) {

            const userId = getUserId(request, false);
    
            if (userId && userId === parent.id) {
                return parent.password;
            } else {
                return null;
            }

        }

    },

    // posts resolver with fragments to request for additional info
    posts: {

        // fragment: we ensure to get the user id on the 'parent' object
        fragment: 'fragment userId on User { id }',

        // resolve function
        resolve(parent, args, { prisma, request }, info) {

            // for each user, get all of their published posts (we enforce to get the id through the
            // fragment regardless of what the client requests)
            return prisma.query.posts({
                where: {
                    author: {
                        id: parent.id
                    },
                    published: true
                }
            }, info);

        }

    }

};

export { User as default };