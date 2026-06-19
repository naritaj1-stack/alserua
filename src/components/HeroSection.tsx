// @ts-nocheck
'use client';


import { ArrowRight } from 'lucide-react';

export default function HeroSection({ dictionary }: { dictionary: Record<string, any> }) {
  const openLeadForm = () => {
    // We will trigger a custom event that the LeadForm modal listens to
    window.dispatchEvent(new CustomEvent('open-lead-form'));
  };

  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background with a premium gradient over an image placeholder */}
      <div 
        className="absolute inset-0 z-0 bg-gray-100"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=2069")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-20">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-md">
          {dictionary.hero.title}
        </h1>
        
        <p className="mt-4 text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 drop-shadow-sm font-light">
          {dictionary.hero.subtitle}
        </p>
        
        <button 
          onClick={openLeadForm}
          className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-green-500 rounded-full hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
        >
          {dictionary.common.orderMeasurement}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Decorative gradient blur at the bottom */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
    </section>
  );
}
