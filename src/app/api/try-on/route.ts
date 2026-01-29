import { NextRequest, NextResponse } from "next/server";
import { Client } from "@gradio/client";
import fs from "fs";
import path from "path";

// Helper to handle various image sources (Data URL, URL, Local Path)
async function getImageData(imageSource: string): Promise<Blob | Buffer> {
    // 1. Handle Data URLs (base64)
    if (imageSource.startsWith("data:")) {
        const res = await fetch(imageSource);
        return await res.blob();
    }
    
    // 2. Handle Remote URLs (http/https)
    if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
        const res = await fetch(imageSource);
        return await res.blob();
    }
    
    // 3. Handle Local Files (starting with /)
    // Assume these are in the public directory
    if (imageSource.startsWith("/")) {
        const publicDir = path.join(process.cwd(), "public");
        const filePath = path.join(publicDir, imageSource);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${imageSource}`);
        }
        
        return fs.readFileSync(filePath);
    }
    
    throw new Error("Unsupported image source format");
}

export async function POST(req: NextRequest) {
  try {
    const { user_image, garment_image } = await req.json();

    if (!user_image || !garment_image) {
      return NextResponse.json(
        { error: "Missing user_image or garment_image" },
        { status: 400 }
      );
    }

    const hfToken = process.env.HF_ACCESS_TOKEN;
    if (!hfToken) {
        throw new Error("No HF_ACCESS_TOKEN found in environment variables.");
    }

    console.log("Using HF Token:", hfToken.substring(0, 5) + "...");
    console.log("Connecting to yisol/IDM-VTON...");

    const client = await Client.connect("yisol/IDM-VTON", { 
        hf_token: hfToken
    } as any);

    console.log("Connected. Preparing images...");

    // Convert inputs to Blob or Buffer
    const userBlob = await getImageData(user_image);
    const garmentBlob = await getImageData(garment_image);

    console.log("Images prepared.");

    // Construct the 'dict' parameter for the user image
    const userImageDict = {
        background: userBlob,
        layers: [],
        composite: null
    };

    console.log("Calling /tryon...");

    const result = await client.predict("/tryon", { 
        dict: userImageDict,
        garm_img: garmentBlob,
        garment_des: "clothing", 
        is_checked: true, 
        is_checked_crop: false, 
        denoise_steps: 30,
        seed: 42
    });

    console.log("Generation Result:", result);

    const result_data = result.data as any[];
    
    if (!result_data || result_data.length === 0) {
        throw new Error("Empty result from VTON API");
    }

    const output_image = result_data[0];
    const result_url = output_image.url || output_image.path;

    if (!result_url) {
        throw new Error("No result URL found in API response");
    }

    return NextResponse.json({ result_url });

  } catch (error: any) {
    console.error("VTON Error:", error);
    return NextResponse.json(
      { error: `Generation failed: ${error.message}` },
      { status: 500 }
    );
  }
}
