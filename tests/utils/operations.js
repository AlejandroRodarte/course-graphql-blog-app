import { gql } from 'apollo-boost';

// createUser graphql query with a $data variable
const createUser = gql`
    mutation($data: CreateUserInput!) {
        createUser (
            data: $data
        ) {
            user {
                id
                name
                email
            }
            token
        }
    }
`;

// graphql query to get users
const getUsers = gql`
    query {
        users {
            id
            name
            email
        }
    }
`;

// graphql query for login with $data variable
const login = gql`
    mutation($data: LoginUserInput!) {
        login(
            data: $data
        ) {
            token
        }
    }
`;

// graphql query 
const getProfile = gql`
    query {
        me {
            id
            name
            email
        }
    }
`;

// export all operations
export { createUser, login, getUsers, getProfile };