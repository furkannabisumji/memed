import { ApolloClient, InMemoryCache } from "@apollo/client";

const ENDPOINT = "https://api.testnet.lens.xyz/graphql";

const client = new ApolloClient({
  uri: ENDPOINT,
  cache: new InMemoryCache(),
});

export default client;
