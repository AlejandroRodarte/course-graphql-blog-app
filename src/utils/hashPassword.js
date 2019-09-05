import bcrypt from 'bcryptjs';

// hash password util function
const hashPassword = (password) => {

    // validate password: must be 8+ characters long
    if (password.length < 8) {
        throw new Error('Password must be of 8 characters minimum.');
    }

    // hashing the password with bcryptjs
    return bcrypt.hash(password, 10);

};

export { hashPassword as default };