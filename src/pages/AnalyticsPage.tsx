import React, { useRef, useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, PieChart, BarChart3, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart as RePieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export function AnalyticsPage({ data }: { data: any }) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Colors for charts
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  // 1. Process Income vs Expenses by Month
  const monthlyData = useMemo(() => {
    if (!data?.transactions) return [];
    
    const monthlyMap: Record<string, { name: string; Income: number; Expenses: number }> = {};
    
    data.transactions.forEach((t: any) => {
      const date = new Date(t.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { name: monthYear, Income: 0, Expenses: 0 };
      }
      
      if (t.type === 'deposit') {
        monthlyMap[monthYear].Income += t.amount;
      } else {
        monthlyMap[monthYear].Expenses += t.amount;
      }
    });

    // Sort chronologically (simple sort, assumes within same year usually or needs better parsing)
    return Object.values(monthlyMap);
  }, [data]);

  // 2. Process Expenses by Category
  const categoryData = useMemo(() => {
    if (!data?.transactions) return [];
    
    const catMap: Record<string, number> = {};
    
    data.transactions.forEach((t: any) => {
      if (t.type === 'withdrawal') {
        const cat = t.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + t.amount;
      }
    });

    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#ffffff' // slate-950 or white
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Personal_Money_Manager_Analytics.pdf');
      
    } catch (err) {
      console.error('Error generating PDF', err);
      alert('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <PieChart className="h-8 w-8 text-indigo-500" />
            Advanced Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Deep dive into your financial data</p>
        </div>
        
        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
        >
          <Download className="h-5 w-5" />
          {isExporting ? 'Generating PDF...' : 'Export to PDF'}
        </button>
      </div>

      <div ref={printRef} className="space-y-8 p-1 -m-1">
        
        {/* Income vs Expenses Trend */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-bold">Income vs Expenses (Monthly)</h2>
          </div>
          
          <div className="h-[400px] w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-medium">No data available</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expenses by Category */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-bold">Expenses by Category</h2>
            </div>
            
            <div className="h-[350px] w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 font-medium">No expenses recorded</div>
              )}
            </div>
          </div>

          {/* Cash Flow Line Chart */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-bold">Net Cash Flow</h2>
            </div>
            
            <div className="h-[350px] w-full">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 font-medium">No data available</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
