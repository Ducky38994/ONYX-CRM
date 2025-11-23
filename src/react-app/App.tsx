import { BrowserRouter as Router, Routes, Route } from "react-router";
import Layout from "@/react-app/components/Layout";
import HomePage from "@/react-app/pages/Home";
import CustomersPage from "@/react-app/pages/Customers";
import ProductsPage from "@/react-app/pages/Products";
import QuotationsPage from "@/react-app/pages/Quotations";
import QuotationDetailPage from "@/react-app/pages/QuotationDetail";
import NewQuotationPage from "@/react-app/pages/NewQuotation";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/quotations" element={<QuotationsPage />} />
          <Route path="/quotations/new" element={<NewQuotationPage />} />
          <Route path="/quotations/:id" element={<QuotationDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
