// declaring subscriptions
const Subscription = {

    // the comment resolver to listen for comments in a post
    comment: {
        subscribe(parent, { postId }, { db, pubsub }, info) {

            // find the post
            const post = db.posts.find(post => post.id === postId && post.published);

            // post not found: throw error
            if (!post) {
                throw new Error('The post was not found.')
            }

            // create new channel with the unique post id embedded
            return pubsub.asyncIterator(`comment ${postId}`);

        }
    },

    // the post resolver to listen for new posts: just create the 'post' channel
    post: {
        subscribe(parent, args, { pubsub }, info) {
            return pubsub.asyncIterator('post');
        }
    }

};

export { Subscription as default };