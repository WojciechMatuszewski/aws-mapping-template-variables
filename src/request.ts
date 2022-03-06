import outputs from "../outputs.json";
import { gql } from "@urql/core";
import { createClient } from "@urql/core";
import fetch from "cross-fetch";

async function main() {
  const endpointEntries = Object.entries(outputs)[0];
  if (!endpointEntries) {
    throw new Error("No endpoint entries found. Check the outputs.json file.");
  }

  const endpoints = endpointEntries[1];
  if (!endpoints) {
    throw new Error("No endpoint entries found. Check the outputs.json file.");
  }

  await graphqlRequest(endpoints.GraphQLApiEndpoint);
  await restRequest(endpoints.APIEndpoint);
}

main();

async function graphqlRequest(endpoint: string) {
  console.log("Making AWS AppSync GraphQL request...");

  const client = createClient({
    url: endpoint,
    fetch,
    fetchOptions: {
      headers: {
        Authorization: "doesnotmatter"
      }
    }
  });
  const response = await client
    .query(
      gql`
        query getData {
          getData {
            authorizerContextUsernameProperty
            wholeAuthorizerVariable
          }
        }
      `
    )
    .toPromise();

  if (response.error) {
    throw new Error(response.error.message);
  }

  console.log(JSON.stringify(response.data, null, 2));

  console.log("-----");
}

async function restRequest(endpoint: string) {
  console.log("Making Amazon API Gateway REST request...");

  const rawResponse = await fetch(endpoint, {
    headers: { Authorization: "doesnotmatter" }
  });
  const response = await rawResponse.text();

  console.log(response);

  console.log("-----");
}
