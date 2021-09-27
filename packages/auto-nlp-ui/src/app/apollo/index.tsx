import {
  ApolloClient,
  HttpLink,
  NormalizedCacheObject,
  split,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import config from '../../../config/config.json';
import { cache } from './cache';

const httpLink = new HttpLink({
  uri: config.api,
});

// const wsLink = new WebSocketLink({
//   uri: config.ws,
//   options: {
//     reconnect: true,
//   },
// });

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
// const splitLink = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//     );
//   },
//   wsLink,
//   httpLink,
// );

// export const typeDefs = gql`
//   extend type Query {
//     # local fields
//   }
// `;

console.log(`Creating ApolloClient with endpoint` + config.api);

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache,
  // link: splitLink,
  link: httpLink,
  connectToDevTools: true,
  headers: {
    authorization: localStorage.getItem('token') || '',
  },
  // typeDefs,
});

export { client };
