import jwt from 'jsonwebtoken';

const getUserId = (request) => {

    // get authorization header
    const rawHeader = request.request.headers.authorization;

    // no auth header: error
    if (!rawHeader) {
        throw new Error('Authentication required.');
    }

    // get only the token
    const token = rawHeader.replace('Bearer ', '');

    // verify the token with server secret
    const decoded = jwt.verify(token, 'my-super-secret');

    // return the decoded user id
    return decoded.userId;

};

export { getUserId as default };