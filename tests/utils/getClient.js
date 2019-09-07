import ApolloBoost from 'apollo-boost';

// return new Apollo Client instance
const getClient = () => {
    return new ApolloBoost({
        uri: 'http://localhost:4000'
    });    
}

export { getClient as default };