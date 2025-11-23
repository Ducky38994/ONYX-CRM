import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Users, Package, FileText, Plus, Filter } from "lucide-react";
import { useApi } from "@/react-app/hooks/useApi";
import { Customer, Product } from "@/shared/types";
import QuotationCalendar from "@/react-app/components/QuotationCalendar";

export default function Home() {
  const { data: customers } = useApi<Customer[]>("/api/customers");
  const { data: products } = useApi<Product[]>("/api/products");
  const { data: quotations } = useApi<any[]>("/api/quotations");
  
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");

  const countries = useMemo(() => {
    if (!quotations) return [];
    const countrySet = new Set<string>();
    quotations.forEach((q) => {
      if (q.country) countrySet.add(q.country);
    });
    return Array.from(countrySet).sort();
  }, [quotations]);

  const states = useMemo(() => {
    if (!quotations) return [];
    const stateSet = new Set<string>();
    quotations
      .filter((q) => !selectedCountry || q.country === selectedCountry)
      .forEach((q) => {
        if (q.state) stateSet.add(q.state);
      });
    return Array.from(stateSet).sort();
  }, [quotations, selectedCountry]);

  const filteredQuotations = useMemo(() => {
    if (!quotations) return [];
    return quotations.filter((q) => {
      if (selectedCountry && q.country !== selectedCountry) return false;
      if (selectedState && q.state !== selectedState) return false;
      return true;
    });
  }, [quotations, selectedCountry, selectedState]);

  const stats = [
    {
      label: "Total Customers",
      value: customers?.length || 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      link: "/customers",
    },
    {
      label: "Products",
      value: products?.length || 0,
      icon: Package,
      color: "from-emerald-500 to-emerald-600",
      link: "/products",
    },
    {
      label: "Quotations",
      value: filteredQuotations?.length || 0,
      icon: FileText,
      color: "from-violet-500 to-violet-600",
      link: "/quotations",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2">Manage your CRM and quotations efficiently</p>
        </div>
        <Link
          to="/quotations/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-xl hover:scale-105 transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          New Quotation
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedState("");
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              disabled={!selectedCountry}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {(selectedCountry || selectedState) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCountry("");
                  setSelectedState("");
                }}
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-slate-200/60 hover:scale-105"
            >
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10">
                <Icon className="w-full h-full" />
              </div>
              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-slate-600 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Calendar View */}
      <QuotationCalendar quotations={filteredQuotations || []} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Quotations</h2>
          <div className="space-y-3">
            {filteredQuotations?.slice(0, 5).map((quotation) => (
              <Link
                key={quotation.id}
                to={`/quotations/${quotation.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group"
              >
                <div>
                  <p className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                    {quotation.quotation_number}
                  </p>
                  <p className="text-sm text-slate-600">{quotation.customer_name}</p>
                  {(quotation.country || quotation.state) && (
                    <p className="text-xs text-slate-500 mt-1">
                      {[quotation.state, quotation.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">
                    {quotation.currency === "INR" ? "₹" : quotation.currency === "EUR" ? "€" : "$"}
                    {quotation.total?.toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    quotation.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    quotation.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {quotation.status}
                  </span>
                </div>
              </Link>
            ))}
            {!filteredQuotations || filteredQuotations.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No quotations match the current filters</p>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/customers"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-slate-800">Manage Customers</span>
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="font-medium text-slate-800">Manage Products</span>
            </Link>
            <Link
              to="/quotations/new"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 transition-all group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FileText className="w-5 h-5 text-violet-600" />
              </div>
              <span className="font-medium text-slate-800">Create New Quotation</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
