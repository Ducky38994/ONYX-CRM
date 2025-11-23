import { Link } from "react-router";
import { useApi, apiDelete } from "@/react-app/hooks/useApi";
import { Plus, Eye, Trash2, Calendar, Download, Mail, MessageCircle } from "lucide-react";

export default function Quotations() {
  const { data: quotations, loading, refetch } = useApi<any[]>("/api/quotations");

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    try {
      await apiDelete(`/api/quotations/${id}`);
      refetch();
    } catch (error) {
      console.error("Failed to delete quotation:", error);
    }
  };

  const handleEmail = (quotation: any) => {
    const subject = `Quotation ${quotation.quotation_number} - ONYX MACHINERY PRIVATE LIMITED`;
    const quotationUrl = `${window.location.origin}/quotations/${quotation.id}`;
    const currencySymbol = quotation.currency === "INR" ? "₹" : quotation.currency === "EUR" ? "€" : "$";
    
    const body = `Dear Valued Customer,

Thank you for your interest in ONYX MACHINERY products. Please find the quotation details below.

QUOTATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quotation Number: ${quotation.quotation_number}
Customer: ${quotation.customer_name}
Date: ${new Date(quotation.quotation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Total Amount: ${currencySymbol}${quotation.total?.toFixed(2)} ${quotation.currency}

VIEW & DOWNLOAD QUOTATION:
${quotationUrl}

Thank you for considering ONYX MACHINERY.

Best regards,

ONYX MACHINERY PRIVATE LIMITED
40, Uday Industrial Estate, Opp. GIDC, Odhav,
Ahmedabad - 382415. Gujarat, INDIA.

Email: sales@onyxmachinery.in
Website: www.onyxmachinery.in
Contact: +91 70 41 40 35 91 | +91 72 27 82 82 84`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleWhatsApp = (quotation: any) => {
    const quotationUrl = `${window.location.origin}/quotations/${quotation.id}`;
    const currencySymbol = quotation.currency === "INR" ? "₹" : quotation.currency === "EUR" ? "€" : "$";
    
    const message = `*ONYX MACHINERY PRIVATE LIMITED*

Dear Valued Customer,

Thank you for your interest. Please find the quotation details below.

*QUOTATION DETAILS:*
━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Quotation No: ${quotation.quotation_number}
👤 Customer: ${quotation.customer_name}
📅 Date: ${new Date(quotation.quotation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
💰 Total: ${currencySymbol}${quotation.total?.toFixed(2)} ${quotation.currency}

*VIEW & DOWNLOAD PDF:*
${quotationUrl}

Thank you for considering ONYX MACHINERY.

━━━━━━━━━━━━━━━━━━━━━━━━━
📧 sales@onyxmachinery.in
🌐 www.onyxmachinery.in
📞 +91 70 41 40 35 91 | +91 72 27 82 82 84`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDownload = (id: number) => {
    window.open(`/quotations/${id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Quotations
          </h1>
          <p className="text-slate-600 mt-2">Manage and track your quotations</p>
        </div>
        <Link
          to="/quotations/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl hover:scale-105 transition-all shadow-lg shadow-violet-500/30"
        >
          <Plus className="w-5 h-5" />
          New Quotation
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Quotation #
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotations?.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-slate-800">
                      {quotation.quotation_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-800">{quotation.customer_name}</p>
                      {quotation.customer_company && (
                        <p className="text-sm text-slate-600">{quotation.customer_company}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(quotation.quotation_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <span>{quotation.currency === "INR" ? "₹" : quotation.currency === "EUR" ? "€" : "$"}{quotation.total?.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(quotation.status)}`}>
                      {quotation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/quotations/${quotation.id}`}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Link>
                      <button
                        onClick={() => handleDownload(quotation.id)}
                        className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4 text-violet-600" />
                      </button>
                      <button
                        onClick={() => handleEmail(quotation)}
                        className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Send via Email"
                      >
                        <Mail className="w-4 h-4 text-emerald-600" />
                      </button>
                      <button
                        onClick={() => handleWhatsApp(quotation)}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                        title="Share via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(quotation.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!quotations || quotations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No quotations yet. Create your first quotation to get started.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
