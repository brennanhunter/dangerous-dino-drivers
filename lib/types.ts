// Shape of the Printify "get a product" response.
// Verified against the Printify v1 OpenAPI spec (developers.printify.com).
// Read defensively — the minimal API example omits some fields.

export interface PrintifyImage {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
}

export interface PrintifyOptionValue {
  id: number;
  title: string;
}

export interface PrintifyOption {
  name: string; // e.g. "Sizes"
  type: string; // e.g. "size"
  values: PrintifyOptionValue[];
}

export interface PrintifyVariant {
  id: number; // <-- variant_id passed to the create-order endpoint
  sku?: string;
  cost?: number; // cents — what Printify charges you
  price: number; // cents — retail price you set
  title: string;
  grams?: number;
  is_enabled: boolean; // merchant on/off toggle
  is_default?: boolean;
  is_available: boolean; // print-provider stock; can change
  options?: number[]; // optionValue ids
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  options: PrintifyOption[];
  variants: PrintifyVariant[];
  images: PrintifyImage[];
  visible?: boolean;
}
