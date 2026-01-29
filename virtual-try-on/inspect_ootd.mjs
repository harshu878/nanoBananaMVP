import { Client } from "@gradio/client";

async function main() {
  try {
    const client = await Client.connect("levihsu/OOTDiffusion");
    const api = await client.view_api();
    console.log("Endpoints:", Object.keys(api.named_endpoints));
  } catch (error) {
    console.error(error);
  }
}
main();
