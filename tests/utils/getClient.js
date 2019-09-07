import ApolloBoost from 'apollo-boost';

// return new Apollo Client instance
const getClient = (jwt) => {
    return new ApolloBoost({
        uri: 'http://localhost:4000',

        request(operation) {

            // check if user passed a defined jwt; if so, set the authorization header with the bearer token
            if (jwt) {
                operation.setContext({
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                });
            }
        }

    });    
}

export { getClient as default };