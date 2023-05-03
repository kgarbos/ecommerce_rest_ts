export interface Product {
  _id: string;
  brand: string;
  category: string;
  countInStock: number;
  description: string;
  image: string;
  name: string;
  numReviews: number;
  price: number;
  productId: string;
  rating: number;
  __v: number;
}

export interface CartItem {
  _id: string;
  productId: string;
  product: Product; // Add this line
  quantity: number;
}
