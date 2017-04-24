import { ApolloClient, createNetworkInterface } from 'apollo-client';

export const apolloClient = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'https://api.graph.cool/simple/v1/ciwdaxg682vpi0171tw2ga8fy'
  }),
});
export function provideApolloClient () {
  return apolloClient;
}
