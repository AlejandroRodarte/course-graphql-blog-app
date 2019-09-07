import bcrypt from 'bcryptjs';
import prisma from '../../src/prisma';

// seed the database
const seedDatabase = async () => {

    // wipe out the database (users, posts and comments)
    await prisma.mutation.deleteManyComments();
    await prisma.mutation.deleteManyPosts();
    await prisma.mutation.deleteManyUsers();

    // seed the database with some dummy data (to test login, queries, deletes and updates)
    // hashing passwors since we are accessing the Prisma API directly
    const user = await prisma.mutation.createUser({
        data: {
            name: 'Alejandro Rodarte',
            email: 'alex@gmail.com',
            password: bcrypt.hashSync('jesus')
        }
    });

    // first dummy post for the first user
    await prisma.mutation.createPost({
        data: {
            title: 'Post 1 by Alejandro.',
            body: 'This is my first post.',
            published: true,
            author: {
                connect: {
                    id: user.id
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
                    id: user.id
                }
            }
        }
    });

};

export { seedDatabase as default };