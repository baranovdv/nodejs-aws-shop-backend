export type Product = {
  id: string | undefined;
  title: string;
  description: string;
  price: number;
}

export type AvailableProduct = {
  id: string | undefined;
  title: string;
  description: string;
  price: number;
  count: number;
}