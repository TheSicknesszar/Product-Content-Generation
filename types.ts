export interface OEMLabelData {
  model_name: string;
  brand: string;
  mtm: string;
  cpu: string;
  ram: string;
  storage: string;
  display: string;
  os: string;
  gpu: string;
  webcam: string;
}

export interface ProductInput {
  oemImage?: File | null;
  oem_label_data: OEMLabelData;
  condition: string;
  target_audience: string; // Comma-separated
  usp: string; // Comma-separated
  price: string;
  location: string;
  local_seo_tags: string; // Comma-separated
  competitor_pricing_data: string; // Comma-separated "Name: price" pairs
}

export interface Competitor {
    name: string;
    price: number;
}

export interface PricingAnalysis {
  lowestCompetitorPrice: number | null;
  highestCompetitorPrice: number | null;
  averageCompetitorPrice: number | null;
  marketPositioning: string;
  suggestedPrice: number | null;
  rationale: string;
  competitors: Competitor[];
}

export interface GeneratedContent {
  productTitle: string;
  seoKeyPhrase: string;
  urlSlug: string;
  longDescriptionHtml: string;
  shortDescriptionHtml: string;
  metaDescription: string;
  productAttributes: Record<string, string>;
  productTags: string; // Comma-separated
  pricingAnalysis: PricingAnalysis;
}