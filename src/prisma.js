// file to connect to the Prisma GraphQL API
import { Prisma } from 'prisma-binding';

// create the connection
const prisma = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: 'http://192.168.99.100:4466'
});

// four key properties on the prisma object: query, mutation, subscription, exists (utility methods)

// Prisma queries (reading data from the database)

// accessing the 'users' query as a method through prisma.query
// all query, mutation and subscription methods accept 2 arguments: 
// operation arguments and the selection set

// in this case, we do not need to pass any operation arguments, while the selection
// argument is declared in an object fashion but as a string, placing the names of the fields
// we want to query

// the idea is that in this two arguments we pass in the data we would type in the GraphQL Playground, 
// just that in this format it looks pretty ugly

// for example, here we access the user posts and its comments as if we were typing the query on the Playground
// we use JSON.stringify() to impede console.log() to hide nested JSON data
// prisma.query.users(null, '{ id name posts { id title comments { id text } } }')
//     .then(data => console.log(JSON.stringify(data, undefined, 2)));

// getting all comments with their author information
// prisma.query.comments(null, '{ id text author { id name } }')
//     .then(data => console.log(JSON.stringify(data, undefined, 2)));


// Prisma mutations
// operation arguments: object very similar to what we would type out in the GraphQL Playground
// selection set: we want all the post scalar fields
// on the Promise resolve, we can return another Promise to chain a query after the mutation is done
// prisma.mutation
//     .createPost({
//         data: {
//             title: "My pet Lola is so amazing.",
//             body: "She is so awesome.",
//             published: false,
//             author: {
//                 connect: {
//                     id: "ck039vk6500cx0724zjkhxjaj"
//                 }
//             }
//         }
//     }, '{ id title body published }')
//     .then(data => {
//         console.log(data);
//         return prisma.query.users(null, '{ id name posts { id title } }');
//     })
//     .then(data => console.log(JSON.stringify(data, undefined, 2)));

// challenge: update a post and then fetch all posts
// prisma.mutation
//     .updatePost({
//         data: {
//             body: "She is gorgeous.",
//             published: true
//         },
//         where: {
//             id: "ck03gjy4h00dv0724clq6vtuh"
//         }
//     }, '{ id title body published }')
//     .then(data => {
//         console.log(data);
//         return prisma.query.posts(null, '{ id title body published }')
//     })
//     .then(data => console.log(data));


// using prisma.exists to check if a particular record exists
prisma.exists.Comment({
    id: 'ck039zkls00d60724rd8q46c1',
    author: {
        id: 'ck039vk6500cx0724zjkhxjaj'
    }
}).then(exists => console.log(exists));


// using async/await to create a new post and fetch all information about the
// author that created the post

const createPostForUser = async (authorId, data) => {

    // check if user exists by id
    const userExists = await prisma.exists.User({ id: authorId });

    // user not found: throw error
    if (!userExists) {
        throw new Error('User not found.');
    }

    // create a post given an author id: get back post information with its author information and the
    // author's posts
    const post = await prisma.mutation.createPost({
        data: {
            ...data,
            author: {
                connect: {
                    id: authorId
                }
            }
        }
    }, '{ id author { id name email posts { id title published } } }');

    // return only the 'author' field of the fetched post
    return post.author;

};

// createPostForUser('ck038i3fs00a507247073wz68', {
//     title: 'Great shit to read',
//     body: 'The War of Caca',
//     published: true
// })
// .then(user => console.log(JSON.stringify(user, undefined, 2)))
// .catch(err => console.log(err.message));

// challenge
const updatePostForUser = async (postId, data) => {

    // check if post exists
    const postExists = await prisma.exists.Post({ id: postId });

    // does not exist: throw error
    if (!postExists) {
        throw new Error('Post does not exist.');
    }

    // update a post by id: from the returned post, get author information with its posts
    const post = await prisma.mutation.updatePost({
        data: {
            ...data
        },
        where: {
            id: postId
        }
    }, '{ author { id name email posts { id title published } } }');

    return post.author;

};

// test case
updatePostForUser('ck04dgom2002n0724lnagbxdz', {
    published: true
})
.then(user => console.log(JSON.stringify(user, undefined, 2)))
.catch(err => console.log(err.message));