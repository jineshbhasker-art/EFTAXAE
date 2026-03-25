import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Search, 
  Star, 
  FileText, 
  ChevronDown,
  LayoutGrid,
  Briefcase,
  BookOpen,
  Info,
  ExternalLink,
  Sparkles,
  Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateTaxImage } from '../services/imageService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const VATLanding: React.FC = () => {
  const navigate = useNavigate();
  const [educationalImages, setEducationalImages] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const sections = [
    {
      title: 'Returns & Refunds',
      items: [
        {
          title: 'My Filings',
          description: 'VAT Return',
          status: '1 Not filed',
          path: '/vat/my-filings'
        },
        {
          title: 'VAT Services',
          description: 'Manage all VAT related services',
          status: 'Active',
          path: '/vat/services'
        },
        {
          title: 'VAT 311',
          description: 'VAT Refunds',
          status: '0 Total Requests',
          path: '/vat/refund'
        },
        {
          title: 'VAT 301',
          description: 'Import Declarations Form for VAT Payment',
          status: null,
          path: '#'
        }
      ]
    },
    {
      title: 'Reporting & Analytics',
      items: [
        {
          title: 'VAT Dashboard',
          description: 'View VAT analytics and reports',
          status: 'Updated today',
          path: '/vat/reporting'
        }
      ]
    },
    {
      title: 'VAT Other Services',
      items: [
        {
          title: 'VAT Administrative Exceptions',
          description: null,
          status: '0 Total Requests',
          path: '#'
        }
      ]
    }
  ];

  const educationalResources = [
    {
      id: 'understanding',
      title: 'Understanding VAT in UAE',
      description: 'Learn the basics of Value Added Tax and how it applies to your business in the Emirates.',
      prompt: 'Understanding VAT in the UAE. Concept of Value Added Tax with UAE business context.',
      tag: 'Basics'
    },
    {
      id: 'filing',
      title: 'The Filing Process',
      description: 'A step-by-step guide to filing your VAT 201 return accurately and on time.',
      prompt: 'The Filing Process for VAT 201. Step-by-step visual guide for tax filing in UAE.',
      tag: 'Guide'
    },
    {
      id: 'compliance',
      title: 'Compliance & Benefits',
      description: 'Discover the benefits of tax compliance and how it supports the UAE national economy.',
      prompt: 'Tax Compliance & Benefits. A compliant business supporting the UAE economy.',
      tag: 'Economy'
    }
  ];

  useEffect(() => {
    const generateAllImages = async () => {
      setIsGenerating(true);
      const images: Record<string, string> = {};
      for (const resource of educationalResources) {
        const img = await generateTaxImage(resource.prompt);
        if (img) {
          images[resource.id] = img;
        }
      }
      setEducationalImages(images);
      setIsGenerating(false);
    };

    generateAllImages();
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-4 sm:px-6 py-2 flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <span className="cursor-pointer hover:text-[#B8860B] shrink-0" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} className="shrink-0" />
        <span className="cursor-pointer hover:text-[#B8860B] shrink-0" onClick={() => navigate('/')}>MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C</span>
        <ChevronRight size={10} className="shrink-0" />
        <span className="text-gray-900 shrink-0">VAT</span>
      </div>

      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto">
        {/* Search Bar */}
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={14} />
            </div>
            <input 
              type="text" 
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded sm:rounded-r-none text-[11px] outline-none focus:border-[#B8860B]"
            />
          </div>
          <button className="px-8 py-2.5 bg-[#0A192F] text-white text-[11px] font-bold uppercase rounded sm:rounded-l-none hover:bg-[#152A4A] transition-colors">
            Search
          </button>
        </div>

        {/* My Favorites */}
        <section>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
            <h3 className="text-[10px] font-bold text-gray-700 uppercase">My Favorites</h3>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </section>

        {/* Sections */}
        {sections.map((section) => (
          <section key={section.title}>
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-[10px] font-bold text-gray-700 uppercase">{section.title}</h3>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {section.items.map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex flex-col group hover:border-[#B8860B] transition-all">
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center text-gray-300">
                        <FileText size={20} />
                      </div>
                      <Star size={14} className="text-gray-300 hover:text-[#B8860B] cursor-pointer" />
                    </div>
                    <h4 className="text-[11px] font-bold text-[#0A192F] uppercase mb-1">{item.title}</h4>
                    {item.description && <p className="text-[10px] text-gray-500 mb-2">{item.description}</p>}
                    {item.status && <p className="text-[9px] font-bold text-[#B8860B] uppercase">{item.status}</p>}
                  </div>
                    <div className="flex border-t border-gray-100">
                      <button 
                        onClick={() => item.path !== '#' && navigate(item.path)}
                        className="flex-1 py-2.5 bg-[#0A192F] text-white text-[10px] font-bold uppercase hover:bg-[#152A4A] transition-colors"
                      >
                        View All
                      </button>
                      {(item.title === 'My Filings' || item.title === 'VAT 311' || item.title === 'VAT Administrative Exceptions' || item.title === 'VAT 301') && (
                        <button 
                          onClick={() => navigate('/vat/new')}
                          className="flex-1 py-2.5 bg-white text-[#B8860B] text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors border-l border-gray-100"
                        >
                          Create New
                        </button>
                      )}
                    </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Educational Resources Section */}
        <section className="pt-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-6">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[#B8860B]" />
              <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Educational Resources</h3>
            </div>
            <div className="flex items-center gap-4">
              {isGenerating && (
                <div className="flex items-center gap-2 text-[9px] font-bold text-[#B8860B] uppercase animate-pulse">
                  <Sparkles size={12} />
                  Generating AI Visuals...
                </div>
              )}
              <button className="text-[9px] font-bold text-[#B8860B] uppercase hover:underline flex items-center gap-1">
                View All Resources <ExternalLink size={10} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {educationalResources.map((resource, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-md border border-gray-100 bg-gray-50">
                  {educationalImages[resource.id] ? (
                    <img 
                      src={educationalImages[resource.id]} 
                      alt={resource.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-300">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Loading AI Visual...</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-[#B8860B] text-white text-[8px] font-bold uppercase rounded shadow-lg">
                      {resource.tag}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-[10px] font-bold uppercase flex items-center gap-2">
                      Read Article <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
                <h4 className="text-[12px] font-black text-[#0A192F] uppercase tracking-tight mb-2 group-hover:text-[#B8860B] transition-colors">
                  {resource.title}
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
                  {resource.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Info Banner */}
        <section className="bg-[#0A192F] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:block">
            <img 
              src="https://tax.gov.ae/assets/images/logo-en.png" 
              alt="FTA" 
              className="w-full h-full object-contain p-12"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Info size={20} className="text-[#B8860B]" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8860B]">Important Notice</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 leading-tight">
              Stay Compliant with the Latest VAT Regulations
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6">
              The Federal Tax Authority regularly updates its guidelines to support businesses in the UAE. 
              Ensure your records are up to date to avoid administrative penalties and benefit from a seamless tax experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="px-6 py-3 bg-[#B8860B] text-white text-[10px] sm:text-[11px] font-bold uppercase rounded hover:bg-[#9A6F09] transition-all shadow-lg shadow-[#B8860B]/20 w-full sm:w-auto">
                Download Latest Guide
              </button>
              <button className="px-6 py-3 bg-white/10 text-white text-[10px] sm:text-[11px] font-bold uppercase rounded hover:bg-white/20 transition-all backdrop-blur-sm w-full sm:w-auto">
                Contact Support
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VATLanding;
