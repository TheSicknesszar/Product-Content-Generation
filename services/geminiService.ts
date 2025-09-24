import { GoogleGenAI, Part } from "@google/genai";
import type { ProductInput, GeneratedContent } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const buildPrompt = (productInput: ProductInput): string => {
  const inputDataForPrompt = { ...productInput };
  // The oemImage is a File object and should not be in the text prompt's JSON part
  delete inputDataForPrompt.oemImage;

  return `
    **Persona:** Act as a knowledgeable and trustworthy tech marketing specialist for TechRestored.co.za. The tone should be professional, clear, and persuasive, focusing on value, reliability, and local South African service. Emphasize quality and performance for the target audience.

    **Core Instructions & Workflow:**
    Based on the provided product data, generate a complete SEO-optimized content package. Your entire response MUST be a single, valid JSON object, with no markdown formatting or text outside the JSON.

    **Expected JSON Structure:**
    {
      "productTitle": "string",
      "seoKeyPhrase": "string",
      "urlSlug": "string",
      "longDescriptionHtml": "string (300-500 words, clean HTML with <h2>, <h3>, <p>, <ul>, <li>, <strong> tags)",
      "shortDescriptionHtml": "string (clean HTML snippet as per instructions)",
      "metaDescription": "string (155-160 characters)",
      "productAttributes": { "key": "value", ... },
      "productTags": "string (comma-separated)",
      "pricingAnalysis": {
        "lowestCompetitorPrice": "number",
        "highestCompetitorPrice": "number",
        "averageCompetitorPrice": "number",
        "marketPositioning": "string",
        "suggestedPrice": "number",
        "rationale": "string (2-3 sentences)",
        "competitors": [{ "name": "string", "price": "number" }]
      }
    }

    **Detailed Content Generation Rules:**

    **Content Sanitization:** When generating user-facing content (like titles, descriptions, tags), do not include specific condition grades (e.g., 'Grade A'). Refer to the condition simply as 'Refurbished' or 'Certified Refurbished' as appropriate for the context.

    1.  **Analyze Input:**
        -   An image of the OEM label may be provided. If it is, **you must use it as the primary source of truth for all OEM specifications** (brand, model, MTM, CPU, RAM, storage, etc.). Perform OCR to extract this data.
        -   The 'Product Data to Use' JSON below provides supplementary information (like condition, price, audience) and can be used as a **fallback for any OEM data you cannot find in the image**.
        -   If there is a conflict between the image and the JSON for an OEM spec, **the data from the image always wins**.
        -   If no image is provided, rely solely on the JSON data.
    2.  **Product Title:** Format: "Refurbished [Brand] [Model] [CPU] [RAM] [Storage]"
    3.  **SEO KeyPhrase:** Format: "Refurbished [Brand] [Model]"
    4.  **URL Slug:** Generate a clean, lowercase, hyphenated slug from the KeyPhrase.
    5.  **Long Description (HTML):** Write a 300-500 word description.
        -   <h2>: Engaging, benefit-oriented headline.
        -   <p>: Hook the reader, address the target audience.
        -   <h3>: "Core Performance for Everyday Success"
        -   <p>: Detail CPU, RAM, SSD and their benefits. Use <strong>.
        -   <h3>: "Quality You Can Trust"
        -   <p>: Explain "Certified Refurbished", mention meticulous testing and the 'local South African warranty'.
        -   <h3>: "Why Choose This Laptop from TechRestored?"
        -   <ul><li>: List the USPs. Weave in location and local SEO tags.
        -   <p>: Strong closing with a call-to-action.
    6.  **Short Description (HTML):** Use this exact HTML structure, populating it with specs:
        \`<div class="headline">[One-sentence summary]</div><h4>Specifications:</h4><ul><li><div class="col-4">CPU: [CPU]</div></li><li>Gen: [CPU Generation]</li><li>Memory: [RAM]</li><li>Drive: [Storage]</li><li>Screen Size: [Display]</li><li>OS: [OS]</li><li>Webcam: [Webcam]</li><li>GPU: [GPU]</li></ul>\`
    7.  **Meta Description:** 155-160 characters. Must include KeyPhrase, a key benefit, and a CTA.
    8.  **Product Attributes:** Create a simple key-value object from the main specs.
    9.  **Product Tags:** Comma-separated list: brand, model, specs, condition, location tags, MTM.
    10. **Pricing Analysis & Recommendation:**
        -   The 'competitor_pricing_data' field is a string containing comma-separated pairs, e.g., "Takealot: 5500, Evetech: 5150".
        -   Parse this string to identify each competitor and their price.
        -   Populate the 'competitors' array in the final JSON with these parsed pairs.
        -   Analyze these prices against the product's own 'price' and USPs.
        -   Calculate lowest, highest, and average competitor price.
        -   State if our price is lower, higher, or average.
        -   Justify a 'suggested_price' based on our value proposition (warranty, testing).
        -   Provide a concise 'pricing_rationale'.

    **Product Data to Use:**
    \`\`\`json
    ${JSON.stringify(inputDataForPrompt, null, 2)}
    \`\`\`
  `;
};

export const generateProductContent = async (
  productInput: ProductInput,
  oemImageBase64: string | null,
  oemImageMimeType: string | null
): Promise<GeneratedContent> => {
  try {
    const textPart: Part = { text: buildPrompt(productInput) };
    const parts: Part[] = [textPart];

    if (oemImageBase64 && oemImageMimeType) {
      const imagePart: Part = {
        inlineData: {
          mimeType: oemImageMimeType,
          data: oemImageBase64,
        },
      };
      // Add image as the first part so the model sees it with the instructions.
      parts.unshift(imagePart);
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    // Basic validation
    if (!parsedJson.productTitle || !parsedJson.pricingAnalysis) {
      throw new Error("Generated content is missing required fields.");
    }
    
    return parsedJson as GeneratedContent;

  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    if (error instanceof Error && error.message.includes('json')) {
      throw new Error("Failed to parse the AI's response. The format was invalid.");
    }
    throw new Error("An unexpected error occurred while generating content.");
  }
};