
import { Client } from "@gradio/client";

async function run() {
    const hfToken = process.env.HF_ACCESS_TOKEN;
    if (!hfToken) {
        console.error("No HF_ACCESS_TOKEN found");
        return;
    }
    
    console.log("Connecting to human37/IDM-VTON...");
    try {
        const client = await Client.connect("human37/IDM-VTON", { hf_token: hfToken });
        const api_info = await client.view_api();
        console.log("API Info:", JSON.stringify(api_info, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
