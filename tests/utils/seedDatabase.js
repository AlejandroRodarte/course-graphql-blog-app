import bcrypt from 'bcryptjs';
import prisma from '../../src/prisma';
import jwt from 'jsonwebtoken';

// global user data: contains the data we insert on the mutation, the data we receive from
// the mutation (the user id) and the user token
const userOne = {
    input: {
        name: 'Alejandro Rodarte',
        email: 'alex@gmail.com',
        password: bcrypt.hashSync('jesucristo')
    },
    user: undefined,
    jwt: undefined
};

// global data for the second user
const userTwo = {
    input: {
        name: 'Patricia Mendoza',
        email: 'paty@gmail.com',
        password: bcrypt.hashSync('guadalupana')
    },
    user: undefined,
    jwt: undefined
};

// global variable for post one: contains input information and a property to store the dumped
// result we get when persisting it to the database (we mainly want the post's id)
const postOne = {
    input: {
        title: 'Post 1 by Alejandro.',
        body: 'This is my first post.',
        published: true
    },
    post: undefined
};

// post two global variable
const postTwo = {
    input: {
        title: 'Post 2 by Alejandro.',
        body: 'This is my second post.',
        published: false
    },
    post: undefined
};

// comment one global variable
const commentOne = {
    input: {
        text: 'This is pretty cool!'
    },
    comment: undefined
};

// comment two global variable
const commentTwo = {
    input: {
        text: 'Amazing!'
    },
    comment: undefined
};

// seed the database
const seedDatabase = async () => {

    // wipe out the database (users, posts and comments)
    await prisma.mutation.deleteManyComments();
    await prisma.mutation.deleteManyPosts();
    await prisma.mutation.deleteManyUsers();

    // seed the database with some dummy data (to test login, queries, deletes and updates)
    // hashing passwors since we are accessing the Prisma API directly

    // store the returned value from the mutation in the global user variable
    userOne.user = await prisma.mutation.createUser({
        data: userOne.input
    });

    // generate the token based on the user if we got from the mutation operation
    userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET);

    // persisting second dummy user to database and store returned value in global object
    userTwo.user = await prisma.mutation.createUser({
        data: userTwo.input
    });

    // token with encoded id of second user
    userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET);

    // first dummy post for the first user
    // store returned value in the `post` property of the global `postOne` object
    postOne.post = await prisma.mutation.createPost({
        data: {
            ...postOne.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    });

    // second dummy post for the first user; store result on postTwo.post
    postTwo.post = await prisma.mutation.createPost({
        data: {
            ...postTwo.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    });

    // persist a new comment by user two on post one
    commentOne.comment = await prisma.mutation.createComment({
        data: {
            ...commentOne.input,
            author: {
                connect: {
                    id: userTwo.user.id
                }
            },
            post: {
                connect: {
                    id: postOne.post.id
                }
            }
        }
    });

    // persist a new comment by user one on post one
    commentTwo.comment = await prisma.mutation.createComment({
        data: {
            ...commentTwo.input,
            author: {
                connect: {
                    id: userOne.user.id
                }
            },
            post: {
                connect: {
                    id: postOne.post.id
                }
            }
        }
    });

};

// export the async function and the global user data
export { 
    seedDatabase as default, userOne, postOne, 
    postTwo, userTwo, commentOne, commentTwo 
};