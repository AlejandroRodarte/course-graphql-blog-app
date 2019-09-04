import jwt from 'jsonwebtoken';

const getUserId = (request, requireAuth = true) => {

    // get authorization header
    const rawHeader = request.request.headers.authorization;

    if (rawHeader) {

        // get only the token
        const token = rawHeader.replace('Bearer ', '');
    
        // verify the token with server secret
        const decoded = jwt.verify(token, 'my-super-secret');
    
        // return the decoded user id
        return decoded.userId;

    }
    
    // no auth header and auth required: throw error
    if (requireAuth) {
        throw new Error('Authentication required.');
    }

    // no auth header and auth not required: return undefined
    return null;

};

export { getUserId as default };