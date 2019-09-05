import jwt from 'jsonwebtoken';

// generate a token to expire in 7 days
const generateToken = (payload) => {
    return jwt.sign(payload, 'my-super-secret', { expiresIn: '7 days' });
};

export { generateToken as default };