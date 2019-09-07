import bcrypt from 'bcryptjs';
import prisma from '../../src/prisma';
import jwt from 'jsonwebtoken';

// global user data: contains the data we insert on the mutation, the data we receive from
// the mutation (the user id) and the user token
const userOne = {
    input: {
        name: 'Alejandro Rodarte',
        email: 'alex@gmail.com',
        password: bcrypt.hashSync('jesus')
    },
    user: undefined,
    jwt: undefined
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

    // first dummy post for the first user
    await prisma.mutation.createPost({
        data: {
            title: 'Post 1 by Alejandro.',
            body: 'This is my first post.',
            published: true,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    });

    // second dummy post for the first user
    await prisma.mutation.createPost({
        data: {
            title: 'Post 2 by Alejandro.',
            body: 'This is my second post.',
            published: false,
            author: {
                connect: {
                    id: userOne.user.id
                }
            }
        }
    });

};

// export the async function and the global user data
export { seedDatabase as default, userOne };