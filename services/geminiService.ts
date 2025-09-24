import { GoogleGenAI, Part } from "@google/genai";
import type { ProductInput, GeneratedContent, CompetitorInput, OEMLabelData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const buildPrompt = (productInput: ProductInput): string => {
  const inputDataForPrompt: any = { ...productInput };
  // The oemImage is a File object and should not be in the text prompt's JSON part
  delete inputDataForPrompt.oemImage;

  // Transform competitors array into the string format expected by the prompt
  if (inputDataForPrompt.competitors && Array.isArray(inputDataForPrompt.competitors)) {
    inputDataForPrompt.competitor_pricing_data = inputDataForPrompt.competitors
      .filter((c: CompetitorInput) => c.name && c.price)
      .map((c: CompetitorInput) => `${c.name.trim()}: ${c.price.trim()}`)
      .join(', ');
    delete inputDataForPrompt.competitors;
  }


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
      "productAttributes": "string (multiline, with each attribute on a new line in 'Key: Value' format)",
      "productTags": "string (comma-separated)",
      "pricingAnalysis": {
        "lowestCompetitorPrice": "number",
        "highestCompetitorPrice": "number",
        "averageCompetitorPrice": "number",
        "marketPositioning": "string",
        "suggestedPrice": "number",
        "rationale": "string (2-3 sentences)",
        "competitors": [{ "name": "string", "price": "number" }],
        "priceGap": "number",
        "recommendation": "string",
        "margin": "number",
        "profit": "number"
      },
      "schemaMarkup": "string (A valid JSON-LD <script> tag)"
    }

    **Detailed Content Generation Rules:**

    **Content Sanitization:** When generating user-facing content (like titles, descriptions, tags), do not include specific condition grades (e.g., 'Grade A'). Refer to the condition simply as 'Refurbished' or 'Certified Refurbished' as appropriate for the context.

    **HTML Generation Note:** When generating HTML for fields like 'longDescriptionHtml' and 'shortDescriptionHtml', ALWAYS use single quotes for attributes (e.g., <div class='my-class'>) to prevent JSON escaping errors.

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
        \`<div class='headline'>[One-sentence summary]</div><h4>Specifications:</h4><ul><li><div class='col-4'>CPU: [CPU]</div></li><li>Gen: [CPU Generation]</li><li>Memory: [RAM]</li><li>Drive: [Storage]</li><li>Screen Size: [Display]</li><li>OS: [OS]</li><li>Webcam: [Webcam]</li><li>GPU: [GPU]</li></ul>\`
    7.  **Meta Description:** 155-160 characters. Must include KeyPhrase, a key benefit, and a CTA.
    8.  **Product Attributes:** Create a single, multi-line string containing the product's core technical specifications. Each attribute MUST be on its own line in the format 'Key: Value'. Be thorough and include all relevant details you can identify, such as 'Brand', 'Model', 'SKU (MTM)', 'Processor', 'Memory', 'Storage', 'Display', 'Screen Size', 'Resolution', 'Operating System', 'Graphics', 'Webcam', 'Ports', etc. **Crucially, you MUST EXCLUDE any non-technical, regulatory, or manufacturing-specific identifiers.** Do not include fields like 'CMIIT ID', 'Manufactured In', 'A/S Tel', 'R-C-E2K', 'YU10152', 'MCMC CIDF', or any similar compliance or contact information. Focus only on customer-relevant technical specs. These attributes should directly correspond to the details you will use for the 'additionalProperty' in the Schema Markup. If a specific detail is unavailable, omit the line.
    9.  **Product Tags:** Comma-separated list: brand, model, specs, condition, location tags, MTM.
    10. **Pricing Intelligence Engine:**
        -   The 'competitor_pricing_data' field is a string containing comma-separated pairs, e.g., "Takealot: 5500, Evetech: 5150".
        -   Parse this string to identify each competitor and their price. Populate the 'competitors' array.
        -   Calculate lowest, highest, and average competitor price.
        -   Justify a 'suggestedPrice' based on our value proposition (warranty, testing, condition).
        -   Calculate 'priceGap' using the formula: \`our_price - averageCompetitorPrice\`.
        -   Provide a 'recommendation' string. If the gap is significantly negative (e.g., < -300), recommend "Consider increasing price". If positive (> 300), recommend "Consider lowering price". Otherwise, "Hold price".
        -   Using the provided 'costPrice', calculate 'profit' (\`suggestedPrice - costPrice\`) and 'margin' (\`(profit / suggestedPrice) * 100\`).
        -   Provide a concise 'rationale' for your suggested price.
    11. **Schema Markup (JSON-LD) (For internal logic only, will not be displayed):**
        -   Generate a complete and valid JSON-LD \`<script type="application/ld+json">\` tag as a single string.
        -   The JSON object inside should have \`"@context": "https://schema.org/"\` and \`"@type": "Product"\`.
        -   Include \`name\` (from the generated Product Title), \`description\` (from the Meta Description), \`sku\` (MTM), and \`brand\` (with \`"@type": "Brand"\`).
        -   The \`additionalProperty\` array must be comprehensive and include all specifications from the \`productAttributes\` object. For each attribute, include \`{"@type": "PropertyValue", "name": "[Attribute Key]", "value": "[Attribute Value]"}\`.
        -   The \`offers\` object with \`"@type": "AggregateOffer"\` must be accurately populated using the results of your pricing analysis.
        -   Inside \`AggregateOffer\`, include \`priceCurrency: "ZAR"\`, \`lowPrice\` (from pricingAnalysis.lowestCompetitorPrice), \`highPrice\` (from pricingAnalysis.highestCompetitorPrice), and \`offerCount\` (number of competitors analyzed plus our own offer).

    **Product Data to Use:**
    \`\`\`json
    ${JSON.stringify(inputDataForPrompt, null, 2)}
    \`\`\`
  `;
};

// Robustly find and parse a JSON object from a string that might contain other text/markdown
const parseJsonFromResponse = (text: string): any => {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not find a valid JSON object in the AI response:", text);
      throw new Error("The AI response did not contain a valid JSON object.");
    }
    return JSON.parse(jsonMatch[0]);
}

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

    const parsedJson = parseJsonFromResponse(response.text);

    // Basic validation
    if (!parsedJson.productTitle || !parsedJson.pricingAnalysis) {
      throw new Error("Generated content is missing required fields.");
    }
    
    // Per user request, schema markup is for backend logic improvement only and should not be sent to the frontend.
    delete parsedJson.schemaMarkup;

    return parsedJson as GeneratedContent;

  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    if (error instanceof Error && error.message.includes('json')) {
      throw new Error("Failed to parse the AI's response. The format was invalid.");
    }
    if (error instanceof Error && error.message.includes('JSON object')) {
        throw new Error("Failed to find a valid JSON object in the AI's response.");
    }
    throw new Error("An unexpected error occurred while generating content.");
  }
};

export const fetchSpecsFromText = async (text: string): Promise<Partial<OEMLabelData>> => {
  const prompt = `
    **Instruction:** You are a data extraction bot. Analyze the following text, which is either a URL to a product page or a product model number: "${text}".
    
    **Action:** Use your search tool to find the technical specifications for this product.
    
    **Output:** Extract the specifications and return them ONLY as a single, valid JSON object. Do not include any other text, explanations, or markdown formatting. If you cannot find a specific piece of information, return an empty string for that key.
    
    **Required JSON Structure:**
    {
      "model_name": "string",
      "brand": "string",
      "mtm": "string",
      "cpu": "string",
      "ram": "string",
      "storage": "string",
      "display": "string",
      "os": "string",
      "gpu": "string",
      "webcam": "string",
      "resolution": "string",
      "color": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const parsedJson = parseJsonFromResponse(response.text);

    // Ensure all keys are present, even if empty, to match the OEMLabelData type
    const requiredKeys: (keyof OEMLabelData)[] = ["model_name", "brand", "mtm", "cpu", "ram", "storage", "display", "os", "gpu", "webcam", "resolution", "color"];
    const result: Partial<OEMLabelData> = {};
    for (const key of requiredKeys) {
        result[key] = parsedJson[key] || "";
    }

    return result as OEMLabelData;

  } catch (error) {
    console.error("Error fetching specs from Gemini API:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("Failed to parse specs from the AI's response.");
    }
    throw new Error("An unexpected error occurred while fetching specs.");
  }
}