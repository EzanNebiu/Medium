export type Review = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  user_phone?: string;
  product_name?: string;
};
