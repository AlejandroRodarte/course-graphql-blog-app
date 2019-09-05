import { extractFragmentReplacements } from 'prisma-binding';

import Query from './Query';
import Mutation from './Mutation';
import Subscription from './Subscription';
import User from './User';
import Post from './Post';
import Comment from './Comment';

// unite the resolvers in a single object
const resolvers = {
    Query,
    Mutation,
    Subscription,
    User,
    Post,
    Comment
};

// read all the resolver definitions; if there are any fragments declared, store them in this variable
const fragmentReplacements = extractFragmentReplacements(resolvers);

// export the resolvers and the fragments declared
// the declared fragments will be passed in to the prisma.js so we can use them when accessing the Prisma API
export { resolvers, fragmentReplacements };