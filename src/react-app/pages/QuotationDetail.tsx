import { useParams, useNavigate } from "react-router";
import { useApi } from "@/react-app/hooks/useApi";
import { ArrowLeft, Calendar, Mail, Phone, Building, MapPin, Download, MessageCircle } from "lucide-react";

export default function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: quotation, loading } = useApi<any>(`/api/quotations/${id}`, [id]);
  const { data: products } = useApi<any[]>("/api/products");

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    if (!quotation) return;
    
    const contactName = quotation.customer?.contact_person_name || quotation.customer?.name || 'Valued Customer';
    const subject = `Quotation ${quotation.quotation_number} - ONYX MACHINERY PRIVATE LIMITED`;
    const quotationUrl = `${window.location.origin}/quotations/${quotation.id}`;
    
    const body = `Dear ${contactName},

Thank you for your interest in ONYX MACHINERY products. We are pleased to submit our quotation for your consideration.

QUOTATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quotation Number: ${quotation.quotation_number}
Date: ${new Date(quotation.quotation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Total Amount: ${getCurrencySymbol(quotation.currency || "USD")}${quotation.total?.toFixed(2)} ${quotation.currency || "USD"}

VIEW & DOWNLOAD QUOTATION:
You can view the complete quotation with detailed specifications and download the PDF here:
${quotationUrl}

We appreciate the opportunity to serve you and look forward to your positive response.

Thank you for considering ONYX MACHINERY for your requirements.

Best regards,

ONYX MACHINERY PRIVATE LIMITED
40, Uday Industrial Estate, Opp. GIDC, Odhav,
Ahmedabad - 382415. Gujarat, INDIA.

Email: sales@onyxmachinery.in
Website: www.onyxmachinery.in
Contact: +91 70 41 40 35 91 | +91 72 27 82 82 84`;
    
    const recipientEmail = quotation.customer?.contact_person_email || quotation.customer?.email || '';
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleWhatsApp = () => {
    if (!quotation) return;
    
    const contactName = quotation.customer?.contact_person_name || quotation.customer?.name || 'Valued Customer';
    const quotationUrl = `${window.location.origin}/quotations/${quotation.id}`;
    
    const message = `*ONYX MACHINERY PRIVATE LIMITED*

Dear ${contactName},

Thank you for your interest in our products. We are pleased to share our quotation with you.

*QUOTATION DETAILS:*
━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Quotation No: ${quotation.quotation_number}
📅 Date: ${new Date(quotation.quotation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
💰 Total Amount: ${getCurrencySymbol(quotation.currency || "USD")}${quotation.total?.toFixed(2)} ${quotation.currency || "USD"}

*VIEW & DOWNLOAD PDF:*
${quotationUrl}

Click the link above to view the complete quotation with detailed technical specifications and download the PDF.

We appreciate the opportunity to serve you and look forward to your positive response.

Thank you for considering ONYX MACHINERY.

━━━━━━━━━━━━━━━━━━━━━━━━━
📧 sales@onyxmachinery.in
🌐 www.onyxmachinery.in
📞 +91 70 41 40 35 91 | +91 72 27 82 82 84

*ONYX MACHINERY PRIVATE LIMITED*
40, Uday Industrial Estate, Opp. GIDC, Odhav,
Ahmedabad - 382415. Gujarat, INDIA.`;
    
    const recipientPhone = quotation.customer?.contact_person_phone || quotation.customer?.phone || '';
    const phoneNumber = recipientPhone.replace(/\D/g, '');
    
    if (phoneNumber) {
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Quotation not found</p>
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

  const currencySymbol = getCurrencySymbol(quotation.currency || "USD");
  const hasTaxes = (quotation.sgst || 0) > 0 || (quotation.cgst || 0) > 0 || (quotation.igst || 0) > 0;

  // Enrich items with full product data
  const enrichedItems = quotation.items?.map((item: any) => ({
    ...item,
    product: products?.find((p: any) => p.id === item.product_id),
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/quotations")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {quotation.quotation_number}
            </h1>
            <p className="text-slate-600 mt-2">Quotation Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-xl hover:scale-105 transition-all shadow-lg shadow-green-500/30"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </button>
          <button
            onClick={handleEmail}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-xl hover:scale-105 transition-all shadow-lg shadow-blue-500/30"
          >
            <Mail className="w-5 h-5" />
            Email
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl hover:scale-105 transition-all shadow-lg shadow-violet-500/30"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/60 print:shadow-none print:border-0 print:p-0 print:m-0 page-break-inside-avoid">
        {/* Header - Letterhead Style */}
        <div className="flex items-start justify-between mb-6 pb-6 border-b-2 border-slate-800 print:mb-4 print:pb-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-800 mb-3 print:text-base print:mb-2">
              ONYX MACHINERY PRIVATE LIMITED
            </h2>
            <div className="text-sm text-slate-700 space-y-1 print:text-xs print:space-y-0">
              <p>40, Uday Industrial Estate, Opp. GIDC, Odhav,</p>
              <p>Ahmedabad - 382415. Gujarat, INDIA.</p>
              <p className="mt-2">
                <a href="mailto:sales@onyxmachinery.in" className="text-blue-600 hover:underline">sales@onyxmachinery.in</a>
                {" | "}
                <a href="http://www.onyxmachinery.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.onyxmachinery.in</a>
              </p>
              <p className="font-medium">Contact: +91 70 41 40 35 91 | +91 72 27 82 82 84</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-4 print:gap-2">
            <img 
              src="https://mocha-cdn.com/019aaf70-4f29-7106-a6b1-a92299e1f5d3/logo-1.png" 
              alt="ONYX MACHINERY" 
              className="h-20 w-auto object-contain print:h-12"
            />
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-1 print:text-xs print:mb-0">Quotation Number</p>
              <p className="font-mono text-2xl font-bold text-slate-800 print:text-base">{quotation.quotation_number}</p>
              <div className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-medium border ${getStatusColor(quotation.status)}`}>
                {quotation.status}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 pb-6 border-b border-slate-200 print:gap-4 print:mb-4 print:pb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Bill To
            </h3>
            <div className="space-y-2">
              <p className="text-lg font-bold text-slate-800">{quotation.customer?.name}</p>
              {quotation.customer?.company && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building className="w-4 h-4" />
                  <span>{quotation.customer.company}</span>
                </div>
              )}
              {quotation.customer?.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{quotation.customer.email}</span>
                </div>
              )}
              {quotation.customer?.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{quotation.customer.phone}</span>
                </div>
              )}
              {quotation.customer?.address && (
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{quotation.customer.address}</span>
                </div>
              )}
              {(quotation.customer?.state || quotation.customer?.country) && (
                <div className="text-slate-600">
                  {quotation.customer?.state && <span>{quotation.customer.state}</span>}
                  {quotation.customer?.state && quotation.customer?.country && <span>, </span>}
                  {quotation.customer?.country && <span>{quotation.customer.country}</span>}
                </div>
              )}
            </div>
            
            {(quotation.customer?.contact_person_name || quotation.customer?.contact_person_email || quotation.customer?.contact_person_phone) && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Contact Person
                </h3>
                <div className="space-y-2">
                  {quotation.customer?.contact_person_name && (
                    <p className="text-slate-800 font-medium">{quotation.customer.contact_person_name}</p>
                  )}
                  {quotation.customer?.contact_person_email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span>{quotation.customer.contact_person_email}</span>
                    </div>
                  )}
                  {quotation.customer?.contact_person_phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span>{quotation.customer.contact_person_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Quotation Date
            </h3>
            <div className="flex items-center gap-2 text-slate-800">
              <Calendar className="w-5 h-5" />
              <span className="text-lg font-medium">
                {new Date(quotation.quotation_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 print:mb-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 print:text-xs print:mb-2">
            Items
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotation.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{item.product_name}</p>
                        {item.product_description && (
                          <p className="text-sm text-slate-600 mt-1">{item.product_description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-800">
                      {currencySymbol}{item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-slate-800">
                      {currencySymbol}{(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Section */}
        <div className="flex justify-end mb-6 print:mb-4">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <div className="space-y-3 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">
                  {currencySymbol}{(quotation.subtotal || quotation.total).toFixed(2)}
                </span>
              </div>

              {hasTaxes && (
                <>
                  {(quotation.sgst || 0) > 0 && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>SGST (9%)</span>
                      <span className="font-medium">
                        {currencySymbol}{quotation.sgst.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {(quotation.cgst || 0) > 0 && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>CGST (9%)</span>
                      <span className="font-medium">
                        {currencySymbol}{quotation.cgst.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {(quotation.igst || 0) > 0 && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>IGST (18%)</span>
                      <span className="font-medium">
                        {currencySymbol}{quotation.igst.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-slate-300 pt-3"></div>
                </>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-semibold text-slate-700">Total Amount</span>
                <span className="text-2xl font-bold text-slate-800">
                  {currencySymbol}{quotation.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div className="pt-6 border-t border-slate-200 print:pt-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Notes
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap">{quotation.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500 print:mt-4 print:pt-3 print:text-xs">
          <p>Thank you for your business!</p>
        </div>
      </div>

      {/* Annexure Pages - Only visible when printing */}
      {enrichedItems && enrichedItems.length > 0 && (
        <div className="hidden print:block">
          {enrichedItems.map((item: any, index: number) => (
            <div key={item.id} className="annexure-item">
              <div className="bg-white print:p-0 print:m-0">
                {/* Annexure Letterhead */}
                <div className="flex items-start justify-between mb-4 pb-3 border-b-2 border-slate-800">
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-slate-800 mb-1">
                      ONYX MACHINERY PRIVATE LIMITED
                    </h2>
                    <div className="text-xs text-slate-700 space-y-0">
                      <p>40, Uday Industrial Estate, Opp. GIDC, Odhav, Ahmedabad - 382415. Gujarat, INDIA.</p>
                      <p>sales@onyxmachinery.in | www.onyxmachinery.in | +91 70 41 40 35 91 | +91 72 27 82 82 84</p>
                    </div>
                  </div>
                  <img 
                    src="https://mocha-cdn.com/019aaf70-4f29-7106-a6b1-a92299e1f5d3/logo-1.png" 
                    alt="ONYX MACHINERY" 
                    className="h-10 w-auto object-contain"
                  />
                </div>
                
                <h2 className="text-lg font-bold text-slate-800 mb-4 text-center border-b border-slate-300 pb-2">
                  ANNEXURE - TECHNICAL SPECIFICATIONS
                </h2>
                
                <div className="border border-slate-300 p-4 page-break-inside-avoid">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-white bg-slate-700 w-10 h-10 flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-800 mb-1">
                        {item.product_name}
                      </h3>
                      {item.product?.hsn_code && (
                        <p className="text-xs text-slate-600 font-medium">
                          HSN Code: <span className="font-mono">{item.product.hsn_code}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {item.product?.image_url && (
                    <div className="mb-3 bg-slate-50 border border-slate-200 page-break-inside-avoid">
                      <img
                        src={item.product.image_url}
                        alt={item.product_name}
                        className="w-full h-48 object-contain p-2"
                      />
                    </div>
                  )}

                  <div className="bg-slate-50 p-3 border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">
                      Technical Specifications
                    </h4>
                    {item.product?.description ? (
                      <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {item.product.description}
                      </div>
                    ) : item.product_description ? (
                      <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {item.product_description}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No technical specifications available</p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-300 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-600 mb-0.5">Quantity</p>
                      <p className="text-sm font-bold text-slate-800">{item.quantity} Units</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-0.5">Unit Price</p>
                      <p className="text-sm font-bold text-slate-800">
                        {currencySymbol}{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
