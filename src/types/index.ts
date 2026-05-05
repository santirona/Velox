export interface Product {
  barcode: string;
  name: string;
  quantity: number;
}

export interface CartState {
  [barcode: string]: Product;
}