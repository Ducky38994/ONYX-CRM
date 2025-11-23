import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useApi, apiPost } from "@/react-app/hooks/useApi";
import { Customer, Product, CreateQuotationItem } from "@/shared/types";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export default function NewQuotation() {
  const navigate = useNavigate();
  const { data: customers } = useApi<Customer[]>("/api/customers");
  const { data: products } = useApi<Product[]>("/api/products");

  const [formData, setFormData] = useState({
    customer_id: 0,
    quotation_date: new Date().toISOString().split("T")[0],
    notes: "",
    currency: "USD",
  });

  const [items, setItems] = useState<CreateQuotationItem[]>([
    { product_id: 0, quantity: 1, price: 0 },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (formData.customer_id && customers) {
      const customer = customers.find((c) => c.id === formData.customer_id);
      setSelectedCustomer(customer || null);
    }
  }, [formData.customer_id, customers]);

  const handleAddItem = () => {
    setItems([...items, { product_id: 0, quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CreateQuotationItem, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill price when product is selected
    if (field === "product_id" && products) {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].price = product.price;
      }
    }
    
    setItems(newItems);
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "INR":
        return "₹";
      case "EUR":
        return "€";
      case "USD":
      default:
        return "$";
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTaxes = () => {
    const subtotal = calculateSubtotal();
    let sgst = 0;
    let cgst = 0;
    let igst = 0;

    if (selectedCustomer?.country?.toUpperCase() === "INDIA") {
      if (selectedCustomer?.state?.toUpperCase() === "GUJARAT") {
        // SGST and CGST for Gujarat
        sgst = subtotal * 0.09;
        cgst = subtotal * 0.09;
      } else {
        // IGST for other Indian states
        igst = subtotal * 0.18;
      }
    }
    // No taxes for international customers

    return { sgst, cgst, igst };
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const { sgst, cgst, igst } = calculateTaxes();
    return subtotal + sgst + cgst + igst;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.customer_id === 0) {
      alert("Please select a customer");
      return;
    }
    
    if (items.some((item) => item.product_id === 0)) {
      alert("Please select products for all items");
      return;
    }
    
    try {
      const subtotal = calculateSubtotal();
      const { sgst, cgst, igst } = calculateTaxes();
      
      const quotation = await apiPost<any>("/api/quotations", {
        ...formData,
        status: "pending",
        subtotal,
        sgst,
        cgst,
        igst,
        items,
      });
      navigate(`/quotations/${quotation.id}`);
    } catch (error) {
      console.error("Failed to create quotation:", error);
      alert("Failed to create quotation. Please try again.");
    }
  };

  const taxes = calculateTaxes();
  const subtotal = calculateSubtotal();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/quotations")}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            New Quotation
          </h1>
          <p className="text-slate-600 mt-2">Create a new quotation for your customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Quotation Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer *
              </label>
              <select
                required
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              >
                <option value={0}>Select a customer</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.company ? `(${customer.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.quotation_date}
                onChange={(e) => setFormData({ ...formData, quotation_date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Currency *
              </label>
              <select
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Add any additional notes or terms..."
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Items</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Product
                  </label>
                  <select
                    value={item.product_id}
                    onChange={(e) => handleItemChange(index, "product_id", parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value={0}>Select a product</option>
                    {products?.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="w-40">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      {getCurrencySymbol(formData.currency)}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="w-40">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subtotal
                  </label>
                  <div className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800">
                    {getCurrencySymbol(formData.currency)}{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Subtotal</span>
                <span className="text-lg font-bold">
                  {getCurrencySymbol(formData.currency)}{subtotal.toFixed(2)}
                </span>
              </div>

              {selectedCustomer?.country?.toUpperCase() === "INDIA" && (
                <>
                  {selectedCustomer?.state?.toUpperCase() === "GUJARAT" ? (
                    <>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>SGST (9%)</span>
                        <span className="font-medium">
                          {getCurrencySymbol(formData.currency)}{taxes.sgst.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>CGST (9%)</span>
                        <span className="font-medium">
                          {getCurrencySymbol(formData.currency)}{taxes.cgst.toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>IGST (18%)</span>
                      <span className="font-medium">
                        {getCurrencySymbol(formData.currency)}{taxes.igst.toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="pt-3 border-t border-slate-300 flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-700">Total Amount</span>
                <span className="text-3xl font-bold text-slate-800">
                  {getCurrencySymbol(formData.currency)}{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/quotations")}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-medium"
          >
            Create Quotation
          </button>
        </div>
      </form>
    </div>
  );
}
