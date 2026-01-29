
import { Client } from "@gradio/client";

async function checkYisol() {
  try {
    const client = await Client.connect("yisol/IDM-VTON");
    const apiInfo = await client.view_api();
    console.log("yisol/IDM-VTON API Info:");
    console.log(JSON.stringify(apiInfo, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

checkYisol();
