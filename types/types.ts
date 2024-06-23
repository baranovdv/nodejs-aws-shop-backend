export type Product = {
  id: string | undefined;
  title: string;
  description: string;
  price: number;
}

export type Stock = {
  product_id: String;
  count: number;
}

export type AvailableProduct = {
  id: string | undefined;
  title: string;
  description: string;
  price: number;
  count: number;
}