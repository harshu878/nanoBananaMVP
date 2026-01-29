
import { Client } from "@gradio/client";

const spaces = [
  "yisol/IDM-VTON",
  "human37/IDM-VTON",
  "cuuupid/idm-vton",
  "KW-AI/Kolors-Virtual-Try-On", 
  "TencentARC/PhotoMaker-V2"
];

async function checkSpaces() {
  console.log("Probing Spaces for availability...");
  
  for (const space of spaces) {
    console.log(`\n--- Checking ${space} ---`);
    try {
      // Connect without token first to check public availability
      const client = await Client.connect(space);
      const apiInfo = await client.view_api();
      console.log(`✅ CONNECTED to ${space}`);
      console.log(`Endpoints: ${Object.keys(apiInfo.named_endpoints).join(", ")}`);
    } catch (error: any) {
      console.log(`❌ FAILED ${space}: ${error.message}`);
    }
  }
}

checkSpaces();
