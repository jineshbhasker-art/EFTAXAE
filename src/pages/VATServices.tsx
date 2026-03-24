import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { VATReturn, Document as VATDocument } from '../types';
import { dataService } from '../services/dataService';
import { 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  FileText,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Clock,
  FileDown,
  Upload,
  File,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { generateVAT201PDF } from '../lib/pdfGenerator';

const VATServices: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [returns, setReturns] = useState<VATReturn[]>([]);
  const [documents, setDocuments] = useState<VATDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('VAT Returns');
  const [activeSubTab, setActiveSubTab] = useState('VAT Returns');
  const [uploading, setUploading] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState('');

  const mainTabs = [
    'VAT Returns', 
    'VAT Refund', 
    'VAT De-registration', 
    'VAT Registration Amendment', 
    'VAT Voluntary Disclosure', 
    'VAT 311', 
    'VAT 312',
    'Document Upload'
  ];

  const subTabs = [
    'VAT Returns',
    'VAT 201 - New VAT Return',
    'VAT 201 - Submitted VAT Returns'
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [returnsData, docsData] = await Promise.all([
        dataService.getVATReturns(),
        dataService.getDocuments()
      ]);
      setReturns(returnsData as any);
      setDocuments(docsData as any);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.period.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ret.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ret.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadPDF = (ret: VATReturn) => {
    generateVAT201PDF(ret);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this return?')) return;
    try {
      await dataService.deleteVATReturn(id);
      setReturns(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting return:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedReturnId) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileData = event.target?.result as string;
        await dataService.uploadDocument({
          vatReturnId: selectedReturnId,
          fileName: file.name,
          fileType: file.type,
          fileData
        });
        const updatedDocs = await dataService.getDocuments();
        setDocuments(updatedDocs);
        setSelectedReturnId('');
        alert('Document uploaded successfully');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDoc = async (id: string) => {
    try {
      await dataService.downloadDocument(id);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading VAT Services...</div>;

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-6 py-3 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} />
        <span className="text-[#B8860B]">VAT Services</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">VAT Services</h1>
        </div>

        {/* Main Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'VAT 311' || tab === 'VAT Refund') {
                  navigate('/vat/refund');
                } else {
                  setActiveTab(tab);
                }
              }}
              className={`px-6 py-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab 
                  ? 'border-[#B8860B] text-[#B8860B]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'VAT Returns' && (
          <>
            {/* Sub Tabs */}
            <div className="flex gap-4">
              {subTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                    activeSubTab === tab 
                      ? 'bg-[#0A192F] text-white' 
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search returns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none focus:border-[#B8860B] w-64"
                    />
                  </div>
                  <div className="relative">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded text-[11px] font-bold text-gray-600 outline-none appearance-none cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Draft">Draft</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Filed">Filed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-[11px] font-bold text-gray-600 hover:bg-gray-50">
                    <Download size={14} />
                    Export
                  </button>
                  <button 
                    onClick={() => navigate('/vat/new')}
                    className="flex items-center gap-2 px-4 py-1.5 bg-[#B8860B] text-white rounded text-[11px] font-bold hover:bg-[#9A6F09] transition-all"
                  >
                    <Plus size={14} />
                    Add New VAT Return
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="py-3 px-4">Tax Period</th>
                      <th className="py-3 px-4">Reference Number</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Total Sales (AED)</th>
                      <th className="py-3 px-4">Total VAT (AED)</th>
                      <th className="py-3 px-4">Net VAT (AED)</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredReturns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${
                              ret.status === 'Filed' || ret.status === 'Submitted' 
                                ? 'bg-green-50 text-green-600' 
                                : ret.status === 'Overdue'
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-orange-50 text-orange-600'
                            }`}>
                              <FileText size={16} />
                            </div>
                            <span className="text-[11px] font-bold text-gray-900">{ret.period}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[11px] font-mono text-gray-600">
                          {ret.id.substring(0, 12).toUpperCase()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 w-fit ${
                            ret.status === 'Filed' || ret.status === 'Submitted'
                              ? 'bg-green-100 text-green-700' 
                              : ret.status === 'Overdue'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                          }`}>
                            {ret.status === 'Filed' || ret.status === 'Submitted' 
                              ? <CheckCircle2 size={10} /> 
                              : ret.status === 'Overdue'
                                ? <AlertCircle size={10} />
                                : <Clock size={10} />
                            }
                            {ret.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[11px] font-bold text-gray-900">
                          {(ret.totalSales || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-[11px] font-bold text-gray-900">
                          {(ret.totalVAT || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-[11px] font-bold text-[#B8860B]">
                          {(ret.netVAT || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleDownloadPDF(ret)}
                              className="p-1.5 text-gray-400 hover:text-[#B8860B] transition-colors"
                              title="Download PDF"
                            >
                              <FileDown size={14} />
                            </button>
                            <button 
                              onClick={() => navigate(`/vat/${ret.id}`)}
                              className="p-1.5 text-gray-400 hover:text-[#B8860B] transition-colors"
                              title="View Details"
                            >
                              <ChevronRight size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(ret.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-black transition-colors">
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredReturns.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-gray-300" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">No VAT Returns Found</p>
                  <button 
                    onClick={() => navigate('/vat/new')}
                    className="mt-4 text-[10px] font-bold text-[#B8860B] hover:underline uppercase"
                  >
                    Start your first filing
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'Document Upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Upload New Document</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select VAT Return Reference</label>
                  <select 
                    value={selectedReturnId}
                    onChange={(e) => setSelectedReturnId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[11px] outline-none focus:border-[#B8860B]"
                  >
                    <option value="">Select a return...</option>
                    {returns.filter(r => r.status === 'Submitted' || r.status === 'Filed').map(r => (
                      <option key={r.id} value={r.id}>
                        {r.period} - {r.id.substring(0, 12).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Choose File</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      onChange={handleFileUpload}
                      disabled={!selectedReturnId || uploading}
                      className="hidden" 
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload"
                      className={`flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed rounded cursor-pointer transition-all ${
                        !selectedReturnId || uploading
                          ? 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400'
                          : 'bg-white border-[#B8860B] text-[#B8860B] hover:bg-orange-50'
                      }`}
                    >
                      <Upload size={16} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {uploading ? 'Uploading...' : 'Click to Upload Document'}
                      </span>
                    </label>
                  </div>
                  <p className="text-[9px] text-gray-400 italic">Please select a VAT return reference before uploading.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Uploaded Documents</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="py-3 px-4">Document Name</th>
                      <th className="py-3 px-4">VAT Reference</th>
                      <th className="py-3 px-4">Upload Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                              <File size={16} />
                            </div>
                            <span className="text-[11px] font-bold text-gray-900">{doc.fileName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[11px] font-mono text-gray-600 uppercase">
                          {doc.vatRef || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-[11px] text-gray-600">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold uppercase">
                            {doc.fileType.split('/')[1] || 'FILE'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => handleDownloadDoc(doc.id)}
                            className="flex items-center gap-1 ml-auto px-3 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-all"
                          >
                            <Download size={12} />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {documents.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No documents uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VATServices;
