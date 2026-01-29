import { Client } from "@gradio/client";

async function checkSpace(spaceId) {
  try {
    console.log(`\n--- Checking ${spaceId} ---`);
    const client = await Client.connect(spaceId);
    const api_info = await client.view_api();
    console.log(JSON.stringify(api_info, null, 2));
  } catch (error) {
    console.error(`Error connecting to ${spaceId}:`, error.message);
  }
}

async function main() {
  await checkSpace("yisol/IDM-VTON");
  await checkSpace("levihsu/OOTDiffusion");
}

main();
