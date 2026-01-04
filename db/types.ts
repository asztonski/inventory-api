export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderProduct {
  productId: string;
  quantity: number;
  priceAtOrder: number;
}

export interface Order {
  id: string;
  customerId: string;
  products: OrderProduct[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  location: "US" | "Europe" | "Asia";
  createdAt: string;
}

export interface Database {
  products: Product[];
  orders: Order[];
  customers: Customer[];
}
