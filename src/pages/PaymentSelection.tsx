import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  CreditCard, 
  Building2, 
  ArrowLeft,
  ShieldCheck,
  Info,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PaymentSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state || { amount: 0, reference: 'N/A' };

  const paymentOptions = [
    {
      id: 'card',
      title: 'Card Payment',
      description: 'Pay using your Debit or Credit card (Visa, Mastercard)',
      icon: CreditCard,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      path: '/payment-gateway',
      details: 'Instant processing and settlement.'
    },
    {
      id: 'giban',
      title: 'GIBAN Payment',
      description: 'Pay via bank transfer using your unique GIBAN number',
      icon: Building2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      path: '#',
      details: 'GIBAN: AE12 0000 0000 1234 5678 901'
    }
  ];

  return (
    <div className="flex flex-col min-h-full bg-brand-surface">
      <div className="px-4 sm:px-8 py-4 bg-white border-b border-gray-100 flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest overflow-x-auto scrollbar-hide whitespace-nowrap">
        <span className="hover:text-brand-accent cursor-pointer transition-colors shrink-0" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={12} className="shrink-0" />
        <span className="hover:text-brand-accent cursor-pointer transition-colors shrink-0" onClick={() => navigate('/payments')}>Payments</span>
        <ChevronRight size={12} className="shrink-0" />
        <span className="text-brand-primary shrink-0">Payment Selection</span>
      </div>

      <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tight uppercase">Select Payment Method</h1>
            <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Choose how you want to pay your tax liability</p>
          </div>
          <div className="px-4 sm:px-6 py-2 sm:py-3 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 w-full sm:w-auto">
            <p className="text-[7px] sm:text-[8px] font-bold text-white/60 uppercase tracking-widest">Total Payable</p>
            <p className="text-lg sm:text-xl font-black text-brand-accent">AED {paymentData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {paymentOptions.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ y: -5 }}
              onClick={() => option.path !== '#' && navigate(option.path, { state: paymentData })}
              className={cn(
                "bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-xl group relative overflow-hidden",
                option.id === 'giban' && "border-emerald-100"
              )}
            >
              <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl opacity-20", option.bg)} />
              
              <div className="space-y-4 sm:space-y-6 relative z-10">
                <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", option.bg)}>
                  <option.icon size={24} className={cn(option.color, "sm:w-8 sm:h-8")} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-black text-brand-primary uppercase tracking-tight">{option.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">{option.description}</p>
                </div>

                <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Details</p>
                  <p className="text-[10px] sm:text-xs font-black text-brand-primary uppercase tracking-tight break-all">{option.details}</p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black text-brand-accent uppercase tracking-widest group-hover:gap-4 transition-all">
                  {option.id === 'giban' ? (
                    <span className="flex items-center gap-2 text-emerald-600">
                      <Info size={14} /> Use GIBAN for Bank Transfer
                    </span>
                  ) : (
                    <>Proceed to Pay <ChevronRight size={16} /></>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4 text-brand-primary">
            <ShieldCheck size={24} className="text-emerald-500" />
            <h4 className="text-sm font-black uppercase tracking-tight">Secure Payment Environment</h4>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            Your payment is processed through the FTA's secure payment gateway. We support all major local and international cards. For GIBAN payments, please ensure you use the correct reference number to avoid processing delays.
          </p>
          <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PCI DSS Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">256-bit Encryption</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Return
        </button>
      </div>
    </div>
  );
};

export default PaymentSelection;
