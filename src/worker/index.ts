import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  CreateCustomerSchema,
  CreateProductSchema,
  CreateQuotationSchema,
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// Customer endpoints
app.get("/api/customers", async (c) => {
  const db = c.env.DB;
  const customers = await db.prepare("SELECT * FROM customers ORDER BY created_at DESC").all();
  return c.json(customers.results);
});

app.get("/api/customers/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(id).first();
  
  if (!customer) {
    return c.json({ error: "Customer not found" }, 404);
  }
  
  return c.json(customer);
});

app.post("/api/customers", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const validated = CreateCustomerSchema.parse(body);
  
  const result = await db.prepare(
    "INSERT INTO customers (name, email, phone, company, address, country, state, contact_person_name, contact_person_email, contact_person_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    validated.name,
    validated.email || null,
    validated.phone || null,
    validated.company || null,
    validated.address || null,
    validated.country || null,
    validated.state || null,
    validated.contact_person_name || null,
    validated.contact_person_email || null,
    validated.contact_person_phone || null
  ).run();
  
  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(customer);
});

app.put("/api/customers/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();
  const validated = CreateCustomerSchema.parse(body);
  
  await db.prepare(
    "UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, address = ?, country = ?, state = ?, contact_person_name = ?, contact_person_email = ?, contact_person_phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(
    validated.name,
    validated.email || null,
    validated.phone || null,
    validated.company || null,
    validated.address || null,
    validated.country || null,
    validated.state || null,
    validated.contact_person_name || null,
    validated.contact_person_email || null,
    validated.contact_person_phone || null,
    id
  ).run();
  
  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(id).first();
  return c.json(customer);
});

app.delete("/api/customers/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  
  await db.prepare("DELETE FROM customers WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Product endpoints
app.get("/api/products", async (c) => {
  const db = c.env.DB;
  const products = await db.prepare("SELECT * FROM products ORDER BY name ASC").all();
  return c.json(products.results);
});

app.get("/api/products/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const product = await db.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  
  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }
  
  return c.json(product);
});

app.post("/api/products", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const validated = CreateProductSchema.parse(body);
  
  const result = await db.prepare(
    "INSERT INTO products (name, description, price, hsn_code, currency, image_url) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(
    validated.name,
    validated.description || null,
    validated.price,
    validated.hsn_code || null,
    validated.currency || "USD",
    validated.image_url || null
  ).run();
  
  const product = await db.prepare("SELECT * FROM products WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(product);
});

app.put("/api/products/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();
  const validated = CreateProductSchema.parse(body);
  
  await db.prepare(
    "UPDATE products SET name = ?, description = ?, price = ?, hsn_code = ?, currency = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(
    validated.name,
    validated.description || null,
    validated.price,
    validated.hsn_code || null,
    validated.currency || "USD",
    validated.image_url || null,
    id
  ).run();
  
  const product = await db.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  return c.json(product);
});

app.delete("/api/products/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  
  await db.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Quotation endpoints
app.get("/api/quotations", async (c) => {
  const db = c.env.DB;
  const quotations = await db.prepare(`
    SELECT q.*, c.name as customer_name, c.company as customer_company, c.country, c.state
    FROM quotations q
    JOIN customers c ON q.customer_id = c.id
    ORDER BY q.created_at DESC
  `).all();
  return c.json(quotations.results);
});

app.get("/api/quotations/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  
  const quotation = await db.prepare("SELECT * FROM quotations WHERE id = ?").bind(id).first();
  if (!quotation) {
    return c.json({ error: "Quotation not found" }, 404);
  }
  
  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(quotation.customer_id).first();
  
  const items = await db.prepare(`
    SELECT qi.*, p.name as product_name, p.description as product_description
    FROM quotation_items qi
    JOIN products p ON qi.product_id = p.id
    WHERE qi.quotation_id = ?
  `).bind(id).all();
  
  return c.json({
    ...quotation,
    customer,
    items: items.results,
  });
});

app.post("/api/quotations", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const validated = CreateQuotationSchema.parse(body);
  
  // Generate quotation number
  const year = new Date().getFullYear();
  const countResult = await db.prepare(
    "SELECT COUNT(*) as count FROM quotations WHERE quotation_number LIKE ?"
  ).bind(`QT-${year}-%`).first();
  const count = (countResult?.count as number) || 0;
  const quotationNumber = `QT-${year}-${String(count + 1).padStart(4, '0')}`;
  
  // Calculate total
  const total = validated.subtotal + validated.sgst + validated.cgst + validated.igst;
  
  // Insert quotation
  const quotationResult = await db.prepare(
    "INSERT INTO quotations (customer_id, quotation_number, quotation_date, total, status, notes, currency, subtotal, sgst, cgst, igst) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    validated.customer_id,
    quotationNumber,
    validated.quotation_date,
    total,
    validated.status,
    validated.notes || null,
    validated.currency,
    validated.subtotal,
    validated.sgst,
    validated.cgst,
    validated.igst
  ).run();
  
  const quotationId = quotationResult.meta.last_row_id;
  
  // Insert quotation items
  for (const item of validated.items) {
    await db.prepare(
      "INSERT INTO quotation_items (quotation_id, product_id, quantity, price) VALUES (?, ?, ?, ?)"
    ).bind(quotationId, item.product_id, item.quantity, item.price).run();
  }
  
  // Fetch the complete quotation
  const quotation = await db.prepare("SELECT * FROM quotations WHERE id = ?").bind(quotationId).first();
  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(validated.customer_id).first();
  const items = await db.prepare(`
    SELECT qi.*, p.name as product_name, p.description as product_description
    FROM quotation_items qi
    JOIN products p ON qi.product_id = p.id
    WHERE qi.quotation_id = ?
  `).bind(quotationId).all();
  
  return c.json({
    ...quotation,
    customer,
    items: items.results,
  });
});

app.put("/api/quotations/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();
  const validated = CreateQuotationSchema.parse(body);
  
  // Calculate total
  const total = validated.subtotal + validated.sgst + validated.cgst + validated.igst;
  
  // Update quotation
  await db.prepare(
    "UPDATE quotations SET customer_id = ?, quotation_date = ?, total = ?, status = ?, notes = ?, currency = ?, subtotal = ?, sgst = ?, cgst = ?, igst = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(
    validated.customer_id,
    validated.quotation_date,
    total,
    validated.status,
    validated.notes || null,
    validated.currency,
    validated.subtotal,
    validated.sgst,
    validated.cgst,
    validated.igst,
    id
  ).run();
  
  // Delete existing items
  await db.prepare("DELETE FROM quotation_items WHERE quotation_id = ?").bind(id).run();
  
  // Insert new items
  for (const item of validated.items) {
    await db.prepare(
      "INSERT INTO quotation_items (quotation_id, product_id, quantity, price) VALUES (?, ?, ?, ?)"
    ).bind(id, item.product_id, item.quantity, item.price).run();
  }
  
  // Fetch the complete quotation
  const quotation = await db.prepare("SELECT * FROM quotations WHERE id = ?").bind(id).first();
  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(validated.customer_id).first();
  const items = await db.prepare(`
    SELECT qi.*, p.name as product_name, p.description as product_description
    FROM quotation_items qi
    JOIN products p ON qi.product_id = p.id
    WHERE qi.quotation_id = ?
  `).bind(id).all();
  
  return c.json({
    ...quotation,
    customer,
    items: items.results,
  });
});

app.delete("/api/quotations/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  
  await db.prepare("DELETE FROM quotation_items WHERE quotation_id = ?").bind(id).run();
  await db.prepare("DELETE FROM quotations WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Image upload endpoint
app.post("/api/upload/product-image", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const key = `products/${filename}`;
    
    // Upload to R2
    await c.env.R2_BUCKET.put(key, file, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    return c.json({ url: `/api/files/${key}` });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Failed to upload file" }, 500);
  }
});

// File retrieval endpoint
app.get("/api/files/*", async (c) => {
  const key = c.req.path.replace("/api/files/", "");
  const object = await c.env.R2_BUCKET.get(key);
  
  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  
  return c.body(object.body, { headers });
});

export default app;
