import z from "zod";

// Customer schemas
export const CustomerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  address: z.string().nullable(),
  country: z.string().nullable(),
  state: z.string().nullable(),
  contact_person_name: z.string().nullable(),
  contact_person_email: z.string().nullable(),
  contact_person_phone: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  contact_person_name: z.string().optional(),
  contact_person_email: z.string().email().optional().or(z.literal("")),
  contact_person_phone: z.string().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;

// Product schemas
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  hsn_code: z.string().nullable(),
  currency: z.string().nullable(),
  image_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  hsn_code: z.string().optional(),
  currency: z.string().optional(),
  image_url: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;

// Quotation schemas
export const QuotationItemSchema = z.object({
  id: z.number(),
  quotation_id: z.number(),
  product_id: z.number(),
  quantity: z.number(),
  price: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const QuotationSchema = z.object({
  id: z.number(),
  customer_id: z.number(),
  quotation_number: z.string(),
  quotation_date: z.string(),
  total: z.number(),
  status: z.string(),
  notes: z.string().nullable(),
  currency: z.string().nullable(),
  subtotal: z.number().nullable(),
  sgst: z.number().nullable(),
  cgst: z.number().nullable(),
  igst: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateQuotationItemSchema = z.object({
  product_id: z.number(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
});

export const CreateQuotationSchema = z.object({
  customer_id: z.number(),
  quotation_date: z.string(),
  status: z.string(),
  notes: z.string().optional(),
  currency: z.string(),
  subtotal: z.number(),
  sgst: z.number(),
  cgst: z.number(),
  igst: z.number(),
  items: z.array(CreateQuotationItemSchema).min(1, "At least one item is required"),
});

export type Quotation = z.infer<typeof QuotationSchema>;
export type QuotationItem = z.infer<typeof QuotationItemSchema>;
export type CreateQuotation = z.infer<typeof CreateQuotationSchema>;
export type CreateQuotationItem = z.infer<typeof CreateQuotationItemSchema>;

// Extended types with joined data
export type QuotationWithDetails = Quotation & {
  customer: Customer;
  items: (QuotationItem & { product: Product })[];
};
