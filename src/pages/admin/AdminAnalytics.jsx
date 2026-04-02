import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  IndianRupee,
  ShoppingCart,
  TrendingDown,
  CreditCard,
  Tag,
  BarChart3,
  Trophy,
  FolderOpen
} from "lucide-react";

function AdminAnalytics() {
  const [range, setRange] = useState("30d"); // 7d, 30d, ytd, all
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/reports/sales?range=${range}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        setData(result);
      } else {
        toast.error(result.message || "Failed to load sales reports");
      }
    } catch {
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);



  const rangeButtons = [
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Year to Date", value: "ytd" },
    { label: "All Time", value: "all" },
  ];

  if (loading && !data) {
    return (
      <div className="max-w-7xl animate-pulse space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-100 rounded-lg"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-9 w-24 bg-gray-100 rounded-lg"></div>)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 p-6">
              <div className="h-10 w-10 bg-gray-50 rounded-full mb-4"></div>
              <div className="h-6 w-24 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
        <div className="h-[400px] bg-white rounded-2xl border border-gray-100"></div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 min-w-[200px]">
          <p className="text-sm font-semibold text-gray-900 mb-3">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between items-center text-sm mb-1.5 break-all">
              <span className="text-gray-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}
              </span>
              <span className="font-bold text-gray-900">
                {entry.name === "Orders" ? entry.value : `₹${entry.value.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl space-y-6 pb-10">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" /> Sales Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">Deep dive into revenue, discounts, and categories.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          {rangeButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setRange(btn.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${
                range === btn.value
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Highlights Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><IndianRupee className="w-24 h-24" /></div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <IndianRupee className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Gross Revenue</p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-gray-900">₹{data?.summary?.totalRevenue?.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingCart className="w-24 h-24" /></div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-gray-900">{data?.summary?.totalOrders?.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard className="w-24 h-24" /></div>
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-gray-900">₹{data?.summary?.aov?.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Tag className="w-24 h-24" /></div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
            <Tag className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">Total Discounts Given</p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-gray-900">₹{data?.summary?.totalDiscounts?.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Revenue Timeline</h2>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-400"></span> Discounts
              </span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            {data?.chartData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDisc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb7185" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    dy={10}
                    tickFormatter={(val) => {
                      if (range === 'ytd' || range === 'all') {
                        const [, month] = val.split('-');
                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        return monthNames[parseInt(month) - 1] || val;
                      }
                      return val.substring(5); // Show mm-dd
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                  />
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="discounts" name="Discounts Given" stroke="#fb7185" strokeWidth={2} fillOpacity={1} fill="url(#colorDisc)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <TrendingDown className="h-6 w-6 mr-2 opacity-50" /> No sales data in this period
              </div>
            )}
          </div>
        </div>

        {/* Top Categories Details */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top Categories
          </h2>

          <div className="space-y-5">
            {data?.topCategories?.length > 0 ? (
              data.topCategories.map((cat, idx) => (
                <div key={idx} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-gray-800 capitalize">{cat.name}</span>
                    <span className="text-sm font-bold text-indigo-600">₹{cat.revenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2 mt-[-4px]">
                    <span>{cat.unitsSold} units sold</span>
                    <span>{Math.round((cat.revenue / data?.summary?.totalRevenue) * 100) || 0}% of Total</span>
                  </div>
                  {/* Visual Progress Bar Approximation */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-indigo-500' : 'bg-indigo-300'}`}
                      style={{ width: `${Math.max(5, (cat.revenue / data?.topCategories[0]?.revenue) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm flex flex-col items-center">
                <FolderOpen className="h-10 w-10 mb-2 opacity-20" />
                No sales data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;
