import { Client } from "@gradio/client";

async function main() {
  try {
    console.log("Connecting to Kwai-Kolors/Kolors-Virtual-Try-On...");
    const client = await Client.connect("Kwai-Kolors/Kolors-Virtual-Try-On");
    console.log("Connected!");
    
    const api_info = await client.view_api();
    console.log(JSON.stringify(api_info, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
