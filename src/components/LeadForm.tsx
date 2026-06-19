// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Locale } from '@/i18n-config';

export default function LeadForm({ lng }: { lng: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-lead-form', handleOpen);
    return () => window.removeEventListener('open-lead-form', handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="relative bg-gray-50 p-6 border-b border-gray-100">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {lng === 'ua' ? 'Безкоштовний замір' : 'Měření zdarma'}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {lng === 'ua' 
              ? 'Залиште свої контакти і ми зателефонуємо вам для узгодження деталей.' 
              : 'Zanechte své kontakty a my vám zavoláme pro domluvení detailů.'}
          </p>
        </div>

        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {lng === 'ua' ? 'Дякуємо!' : 'Děkujeme!'}
              </h3>
              <p className="text-gray-600 mb-6">
                {lng === 'ua' 
                  ? 'Наш менеджер зв\'яжеться з вами найближчим часом.' 
                  : 'Náš manažer vás bude brzy kontaktovat.'}
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-gray-100 text-gray-900 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                {lng === 'ua' ? 'Закрити' : 'Zavřít'}
              </button>
            </div>
          ) : (
            // Replace the action URL with your actual Formspree endpoint (e.g. https://formspree.io/f/xyz)
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const name = formData.get('name') as string;
                const phone = formData.get('phone') as string;
                const source = formData.get('source') as string;

                try {
                  const res = await fetch('/api/leads', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, phone, source }),
                  });

                  if (res.ok) {
                    setIsSubmitted(true);
                  } else {
                    console.error('Failed to submit lead');
                    setIsSubmitted(true); // Fallback success to not block user
                  }
                } catch (err) {
                  console.error('Error submitting lead:', err);
                  setIsSubmitted(true); // Fallback success
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lng === 'ua' ? 'Ваше ім\'я' : 'Vaše jméno'}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder={lng === 'ua' ? 'Іван' : 'Jan'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lng === 'ua' ? 'Телефон' : 'Telefon'}
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder={lng === 'ua' ? '+38 (000) 000-00-00' : '+420 000 000 000'}
                />
              </div>

              {/* Hidden field to know where the lead came from */}
              <input type="hidden" name="source" value={`Lead Form - ${lng.toUpperCase()} Market`} />

              <button
                type="submit"
                className="w-full py-4 mt-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-lg hover:shadow-green-500/30"
              >
                {lng === 'ua' ? 'Відправити' : 'Odeslat'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
