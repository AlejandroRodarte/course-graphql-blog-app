import getUserId from '../utils/getUserId';

// declaring subscriptions
const Subscription = {

    // the comment resolver to listen for comments in a post
    comment: {
        subscribe(parent, { postId }, { db, pubsub, prisma }, info) {

            // explanation: the 'where' property allows to subscribe to comments that
            // match some criteria
            // such criteria is one where the comment itself has that got created/updated/deleted
            // is related to the particular post id we passed in as an argument
            return prisma.subscription.comment({
                where: {
                    node: {
                        post: {
                            id: postId
                        }
                    }
                }
            }, info);

        }
    },

    // the post resolver to listen for new posts: just create the 'post' channel
    post: {
        subscribe(parent, args, { pubsub, prisma }, info) {

            // subscribe to changes in posts that are published
            return prisma.subscription.post({
                where: {
                    node: {
                        published: true
                    }
                }
            }, info);

        }
    },

    // subscribe to posts given a logged in user id
    myPost: {
        subscribe(parent, args, { prisma, request }, info) {

            // get user id
            const userId = getUserId(request);

            // subscribe to changes in posts related to a paritcular logged in author
            return prisma.subscription.post({
                where: {
                    node: {
                        author: {
                            id: userId
                        }
                    }
                }
            }, info);

        }
    }

};

export { Subscription as default };