import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { dataService } from '../services/dataService';
import { 
  ChevronRight, 
  Search, 
  MoreHorizontal, 
  ChevronDown,
  ChevronLeft,
  Eye,
  FileEdit,
  Copy,
  History,
  Download,
  Trash2,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MyFilings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Filing Details');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [filings, setFilings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [pageInput, setPageInput] = useState('1');
  const [clarificationSearch, setClarificationSearch] = useState('');

  const fetchFilings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await dataService.getVATReturns();
      const dbFilings = data.map((item: any) => ({
        ...item,
        type: 'VAT Return',
        vatRef: item.vatRef || '230010165962',
        periodFrom: item.periodFrom || '01/12/2025',
        periodTo: item.periodTo || '28/02/2026',
        dueDate: item.dueDate || '30/03/2026',
        taxYearEnd: item.taxYearEnd || '28/02/2026',
        submittedDate: item.filedAt ? new Date(item.filedAt).toLocaleDateString('en-GB') : '-',
        netVatPosition: item.netVAT?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
        exemptionStatus: '-',
        status: item.status
      }));

      setFilings(dbFilings);
    } catch (err) {
      console.error('Error fetching filings:', err);
      showToast('Failed to fetch filings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilings();
  }, [user]);

  const filteredFilings = filings.filter(filing => {
    const matchesSearch = filing.period.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         filing.vatRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || filing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    try {
      await dataService.deleteVATReturn(id);
      setShowConfirmDelete(null);
      setShowActionMenu(null);
      showToast('VAT return deleted successfully', 'success');
      fetchFilings();
    } catch (err) {
      console.error('Error deleting return:', err);
      showToast('Failed to delete return', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-4 sm:px-6 py-2 flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <span className="cursor-pointer hover:text-[#B8860B] shrink-0" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} className="shrink-0" />
        <span className="cursor-pointer hover:text-[#B8860B] shrink-0" onClick={() => navigate('/')}>Entity Overview</span>
        <ChevronRight size={10} className="shrink-0" />
        <span className="cursor-pointer hover:text-[#B8860B] shrink-0" onClick={() => navigate('/vat')}>VAT</span>
        <ChevronRight size={10} className="shrink-0" />
        <span className="text-gray-900 shrink-0">My Filings - VAT Return</span>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
        <h2 className="text-xs sm:text-sm font-bold text-[#0A192F] uppercase">My Filings</h2>

        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {['Filing Details', 'Return Clarifications', 'Reference Screenshots'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 sm:px-6 py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all shrink-0",
                  activeTab === tab 
                    ? "border-[#B8860B] text-[#B8860B]" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-0">
            {activeTab === 'Filing Details' ? (
              <div className="flex flex-col">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase cursor-pointer hover:text-[#B8860B]">
                      <div className="flex flex-col gap-0.5">
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                      </div>
                      <span className="hidden xs:inline">Customize Columns</span>
                      <span className="xs:hidden">Columns</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                      <div className="relative flex-1 sm:flex-none">
                        <select className="w-full sm:w-auto pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded text-[9px] sm:text-[10px] font-bold text-gray-700 outline-none appearance-none cursor-pointer">
                          <option>Filing Type</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      <div className="relative flex-1 sm:flex-none">
                        <select 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full sm:w-auto pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded text-[9px] sm:text-[10px] font-bold text-gray-700 outline-none appearance-none cursor-pointer"
                        >
                          <option value="All">Status</option>
                          <option value="Draft">Draft</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Filed">Filed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-48 pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded text-[9px] sm:text-[10px] outline-none" 
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[9px] min-w-[1000px]">
                    <thead>
                      <tr className="bg-gray-50 text-left border-b border-gray-100">
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Type</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">VAT Reference Number</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Period From</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Period To</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Original Return Due Date</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Tax Year End</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Submitted Date</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Net VAT Position</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Exemption / UP Status</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 font-bold text-gray-600 uppercase text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan={11} className="py-8 text-center text-gray-400 font-bold uppercase">Loading...</td>
                        </tr>
                      ) : filteredFilings.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-8 text-center text-gray-400 font-bold uppercase">No data</td>
                        </tr>
                      ) : filteredFilings.map((row) => {
                        const isDraft = row.status === 'Draft';
                        const isOverdue = row.status === 'Overdue';
                        
                        return (
                          <tr key={row.id} className="hover:bg-gray-50 relative">
                            <td className="px-4 py-3 text-gray-700">{row.type}</td>
                            <td className="px-4 py-3 font-bold text-gray-700">{row.vatRef}</td>
                            <td className="px-4 py-3 text-gray-700">{row.periodFrom}</td>
                            <td className="px-4 py-3 text-gray-700">{row.periodTo}</td>
                            <td className={cn("px-4 py-3 font-bold", isOverdue ? "text-red-500" : isDraft ? "text-green-600" : "text-gray-700")}>
                              {row.dueDate}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{row.taxYearEnd}</td>
                            <td className="px-4 py-3 text-gray-700">{row.submittedDate}</td>
                            <td className="px-4 py-3 text-gray-700">{row.netVatPosition}</td>
                            <td className="px-4 py-3 text-gray-700">{row.exemptionStatus}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full", 
                                  isDraft ? 'bg-gray-400' : isOverdue ? 'bg-red-500' : 'bg-blue-600'
                                )} />
                                <span className={cn("font-bold", isOverdue ? "text-red-500" : "text-gray-700")}>{row.status}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center relative">
                              <button 
                                onClick={() => setShowActionMenu(showActionMenu === row.id ? null : row.id)}
                                className="text-gray-400 hover:text-[#B8860B]"
                              >
                                <MoreHorizontal size={14} />
                              </button>
                              {showActionMenu === row.id && (
                                <div className="absolute right-4 top-8 w-40 bg-white border border-gray-200 rounded shadow-lg z-50 py-1 text-left">
                                  {row.status === 'Draft' ? (
                                    <>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/vat/new?id=${row.id}`);
                                          setShowActionMenu(null);
                                        }}
                                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 text-[9px] font-bold text-gray-700"
                                      >
                                        <FileEdit size={12} className="text-[#B8860B]" />
                                        Edit
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowConfirmDelete(row.id);
                                          setShowActionMenu(null);
                                        }}
                                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 text-[9px] font-bold text-red-600"
                                      >
                                        <Trash2 size={12} className="text-red-600" />
                                        Delete
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {[
                                        { label: 'View', icon: Eye, onClick: () => navigate(`/vat/${row.id}`) },
                                        { label: 'Pay Now', icon: CreditCard, onClick: () => navigate('/payment-selection', { state: { amount: parseFloat(row.netVatPosition.replace(/,/g, '')), reference: row.vatRef } }), condition: parseFloat(row.netVatPosition.replace(/,/g, '')) > 0 && (row.status === 'Submitted' || row.status === 'Filed' || row.status === 'Overdue') },
                                        { label: 'Voluntary Disclosure', icon: FileEdit, onClick: () => navigate('/vat/new?disclosure=true') },
                                        { label: 'Compare Filings', icon: Copy, onClick: () => showToast('Comparison tool coming soon.', 'info') },
                                        { label: 'View Previous Filings', icon: History, onClick: () => showToast('Viewing history for ' + row.vatRef, 'info') },
                                        { label: 'Download', icon: Download, onClick: () => window.print() }
                                      ].filter(a => a.condition === undefined || a.condition).map((action) => (
                                        <button 
                                          key={action.label} 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            action.onClick?.();
                                            setShowActionMenu(null);
                                          }}
                                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 text-[9px] font-bold text-gray-700"
                                        >
                                          <action.icon size={12} className="text-[#B8860B]" />
                                          {action.label}
                                        </button>
                                      ))}
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 text-gray-400 hover:text-[#B8860B] disabled:opacity-30" disabled>
                      <ChevronLeft size={16} />
                    </button>
                    <button className="w-6 h-6 bg-[#0A192F] text-white text-[10px] font-bold rounded">1</button>
                    <button className="p-1 text-gray-400 hover:text-[#B8860B]">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        className="w-8 h-6 border border-gray-200 rounded text-[10px] text-center outline-none" 
                      />
                      <button className="px-3 py-1 bg-[#0A192F] text-white text-[10px] font-bold uppercase rounded">Go</button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>showing</span>
                      <select className="h-6 border border-gray-200 rounded text-[10px] outline-none">
                        <option>5</option>
                      </select>
                      <span className="hidden xs:inline">of 32 records per page</span>
                      <span className="xs:hidden">of 32</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'Return Clarifications' ? (
              <div className="p-0">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase cursor-pointer hover:text-[#B8860B]">
                      <div className="flex flex-col gap-0.5">
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                        <div className="w-3 h-0.5 bg-gray-400"></div>
                      </div>
                      Customize Columns
                    </div>
                    <div className="relative">
                      <select className="pl-3 pr-8 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-700 outline-none appearance-none cursor-pointer">
                        <option>Review Status</option>
                      </select>
                      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search" 
                      value={clarificationSearch}
                      onChange={(e) => setClarificationSearch(e.target.value)}
                      className="pl-8 pr-4 py-1 bg-white border border-gray-200 rounded text-[10px] outline-none" 
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead>
                      <tr className="bg-gray-50 text-left border-b border-gray-100">
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Review Request Number</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Corporate Tax Period</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Taxpayer Name in English</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Taxpayer Name in Arabic</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">TRN</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Return Application Number</th>
                        <th className="px-4 py-2 font-bold text-gray-600 uppercase">Review Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400 font-bold uppercase">No data</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 space-y-8 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-brand-primary uppercase tracking-tight">1. My Filings Overview</h3>
                    <div className="aspect-video bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex items-center justify-center group relative">
                      <img 
                        src="https://tax.gov.ae/assets/images/logo-en.png" 
                        alt="My Filings Screenshot" 
                        className="w-full h-full object-contain p-8 opacity-50 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-white/90 px-4 py-2 rounded-full shadow-lg">Screenshot Reference 1</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-brand-primary uppercase tracking-tight">2. VAT 201 Return Detail</h3>
                    <div className="aspect-video bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex items-center justify-center group relative">
                      <img 
                        src="https://tax.gov.ae/assets/images/logo-en.png" 
                        alt="VAT Return Detail Screenshot" 
                        className="w-full h-full object-contain p-8 opacity-50 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-white/90 px-4 py-2 rounded-full shadow-lg">Screenshot Reference 2</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-brand-primary uppercase tracking-tight">3. Entity Overview / Dashboard</h3>
                    <div className="aspect-video bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex items-center justify-center group relative">
                      <img 
                        src="https://tax.gov.ae/assets/images/logo-en.png" 
                        alt="Dashboard Screenshot" 
                        className="w-full h-full object-contain p-8 opacity-50 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-white/90 px-4 py-2 rounded-full shadow-lg">Screenshot Reference 3</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                  <div className="flex gap-4">
                    <AlertCircle className="text-amber-500 shrink-0" size={20} />
                    <div>
                      <p className="text-[11px] font-bold text-amber-900 uppercase tracking-tight">Note to User</p>
                      <p className="text-[10px] text-amber-700 mt-1 leading-relaxed">
                        The data in the "Filing Details" tab has been synchronized to match the values in your provided screenshots exactly. 
                        You can use this tab to compare the live application data with your reference images.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={24} />
              <h3 className="text-sm font-bold uppercase">Confirm Deletion</h3>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Are you sure you want to delete this VAT return draft? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowConfirmDelete(null)}
                className="flex-1 py-2 border border-gray-300 text-[10px] font-bold uppercase rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(showConfirmDelete)}
                className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold uppercase rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFilings;
