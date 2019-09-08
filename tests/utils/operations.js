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

// graphql query to get users' profile with the `me` query
const getProfile = gql`
    query {
        me {
            id
            name
            email
        }
    }
`;

// graphql query to get published posts
const getPosts = gql`
    query {
        posts {
            id
            title
            body
            published
        }
    }
`;

// graphql query to get user-related posts
const getMyPosts = gql`
    query {
        myPosts {
            id
            title
            body
            published
        }
    }
`;

// graphql query to update a post with $id and $data variables
const updatePost = gql`
    mutation($id: ID!, $data: UpdatePostInput!) {
        updatePost(id: $id, data: $data) {
            id
            title
            body
            published
        }
    }
`;

// graphql query to create a post with the $data variable
const createPost = gql`
    mutation($data: CreatePostInput!) {
        createPost(data: $data) {
            id
            title
            body
            published
        }
    }
`;

// graphql query to delete post with $id variable
const deletePost = gql`
    mutation($id: ID!) {
        deletePost(id: $id) {
            id
            title
            body
            published
        }
    }
`;

// graphql query to delete a comment with an $id variable
const deleteComment = gql`
    mutation($id: ID!) {
        deleteComment(id: $id) {
            id
            text
        }
    }
`;

// graphql subscriptions to subscribe to comments of a particular post
const subscribeToComments = gql`
    subscription($postId: ID!) {
        comment(postId: $postId) {
            mutation
            node {
                id
                text
            }
        }
    }
`;

// graphql subscription to subscribe to changes in posts
const subscribeToPosts = gql`
    subscription {
        post {
            mutation
            node {
                id
                title
                body
                published
            }
        }
    }
`;

// export all operations
export { 
    createUser, login, getUsers, getProfile, getPosts, 
    getMyPosts, updatePost, createPost, deletePost,
    deleteComment, subscribeToComments, subscribeToPosts
};