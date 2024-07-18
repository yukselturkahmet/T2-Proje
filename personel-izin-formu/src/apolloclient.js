    // src/apolloClient.js
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';

const client = new ApolloClient({
    link: createHttpLink({
        uri: 'http://localhost:4000/graphql', // replace with your GraphQL server URL
    }),
    cache: new InMemoryCache(),
});

export default client;
