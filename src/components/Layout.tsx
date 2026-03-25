import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Monitor, MessageSquare, Phone, Menu, X } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 relative">
          {children}
          
          {/* Floating Action Buttons */}
          <div className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-50">
            <button className="w-8 h-8 bg-[#0A192F] text-white flex items-center justify-center hover:bg-[#152A4A] transition-colors">
              <Monitor size={16} />
            </button>
            <button className="w-8 h-8 bg-[#0A192F] text-white flex items-center justify-center hover:bg-[#152A4A] transition-colors">
              <MessageSquare size={16} />
            </button>
            <button className="w-8 h-8 bg-[#25D366] text-white flex items-center justify-center hover:bg-[#128C7E] transition-colors">
              <Phone size={16} />
            </button>
          </div>
        </main>
        <footer className="bg-[#F2F2F2] border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            <div className="col-span-1 flex justify-center sm:justify-start">
              <img src="https://tax.gov.ae/assets/images/logo-en.png" alt="FTA" className="h-10 sm:h-12 mb-4 sm:mb-6" referrerPolicy="no-referrer" />
            </div>
            
            <div className="col-span-1 text-center sm:text-left">
              <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-4">QUICK LINKS</h4>
              <ul className="space-y-2 text-[10px] text-gray-600 font-bold">
                <li><a href="#" className="hover:text-[#B8860B]">tax.gov.ae</a></li>
                <li><a href="#" className="hover:text-[#B8860B]">Help Center</a></li>
                <li><a href="#" className="hover:text-[#B8860B]">Glossary</a></li>
              </ul>
            </div>

            <div className="col-span-1 text-center sm:text-left">
              <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-4">OTHER LINKS</h4>
              <ul className="space-y-2 text-[10px] text-gray-600 font-bold">
                <li><a href="#" className="hover:text-[#B8860B]">What's New</a></li>
                <li><a href="#" className="hover:text-[#B8860B]">FAQs</a></li>
                <li><a href="#" className="hover:text-[#B8860B]">Contact Us</a></li>
              </ul>
            </div>

            <div className="col-span-1 text-center sm:text-left">
              <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-4">OUR LOCATION</h4>
              <ul className="space-y-4 text-[10px] text-gray-600 font-bold">
                <li className="flex gap-2 justify-center sm:justify-start">
                  <span className="shrink-0">📍</span>
                  <span>Emirates Property Investment Company Building, P.O. Box 2440, Abu Dhabi, U.A.E</span>
                </li>
                <li className="flex gap-2 justify-center sm:justify-start">
                  <span className="shrink-0">📍</span>
                  <span>Central Park Business Towers - DIFC, P.O. Box 2440, Dubai, U.A.E</span>
                </li>
                <li className="flex gap-2 justify-center sm:justify-start">
                  <span className="shrink-0">📞</span>
                  <span>800 82923</span>
                </li>
                <li className="flex gap-2 justify-center sm:justify-start">
                  <span className="shrink-0">✉️</span>
                  <span>fta@payaetax.online</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#0A192F] py-6 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-[9px] text-white/60 font-medium text-center lg:text-left">
                <p>This site is best viewed in Screen Resolution 1024 x 768</p>
                <p>Supports Microsoft Edge, Firefox 92+, Chrome 93+</p>
                <p className="mt-2">2023 Federal Tax Authority. All rights reserved.</p>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-end gap-x-4 sm:gap-x-6 gap-y-2 text-[9px] text-white font-bold uppercase tracking-wider">
                <a href="#" className="hover:text-[#B8860B]">Disclaimer</a>
                <span className="text-white/20 hidden sm:inline">|</span>
                <a href="#" className="hover:text-[#B8860B]">Terms and Conditions</a>
                <span className="text-white/20 hidden sm:inline">|</span>
                <a href="#" className="hover:text-[#B8860B]">Accessibility</a>
                <span className="text-white/20 hidden sm:inline">|</span>
                <a href="#" className="hover:text-[#B8860B]">Privacy Policy</a>
                <span className="text-white/20 hidden sm:inline">|</span>
                <a href="#" className="hover:text-[#B8860B]">UAE Government Charter Of Future Services</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
