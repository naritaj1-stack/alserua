// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, CheckCircle } from 'lucide-react';
import { Locale } from '@/i18n-config';

type ChatStep = 'greeting' | 'qualification' | 'hook' | 'conversion' | 'lead' | 'success';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
}

export default function FloatingChatBot({ lng }: { lng: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ChatStep>('greeting');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load translations dynamically (for client-side) or pass them down. 
  // Since we are client-side and keeping it simple, we use hardcoded dictionaries or passed ones.
  // We'll define a quick static dictionary for the bot logic.
  const dict = {
    ua: {
      greeting: "Вітаю! Я ваш помічник Alser. Бажаєте оновити вікна чи захистити кімнату від сонця?",
      qualification: "Що вас цікавить найбільше?",
      options: {
        blinds: "Жалюзі",
        rollers: "Рулонні штори",
        curtains: "Штори"
      },
      hook: "Чудовий вибір! Чи знаєте ви, що ми пропонуємо безкоштовний замір сьогодні? Наш експерт привезе понад 100 зразків до вас додому, щоб ви не вгадували з кольором.",
      conversion: "Бажаєте записатися на безкоштовний замір?",
      dateOptions: {
        tomorrow: "На завтра",
        dayAfter: "Післязавтра"
      },
      lead: "Чудово! Залиште свої контакти, і ми зателефонуємо для підтвердження часу.",
      namePlaceholder: "Ваше ім'я",
      phonePlaceholder: "+38 (000) 000-00-00",
      submit: "Відправити",
      success: "Дякуємо! Очікуйте на дзвінок від нашого менеджера найближчим часом."
    },
    cz: {
      greeting: "Dobrý den! Jsem váš asistent Alser. Chcete oživit svá okna nebo chránit místnost před sluncem?",
      qualification: "Co vás zajímá nejvíce?",
      options: {
        blinds: "Žaluzie",
        rollers: "Rolety",
        curtains: "Závěsy"
      },
      hook: "Skvělá volba! Víte, že dnes nabízíme měření zdarma? Náš odborník přinese více než 100 vzorků k vám domů, abyste nemuseli hádat barvu.",
      conversion: "Chcete si objednat měření zdarma?",
      dateOptions: {
        tomorrow: "Na zítra",
        dayAfter: "Pozítří"
      },
      lead: "Skvělé! Zanechte své kontakty a my vám zavoláme pro potvrzení času.",
      namePlaceholder: "Vaše jméno",
      phonePlaceholder: "+420 000 000 000",
      submit: "Odeslat",
      success: "Děkujeme! Očekávejte brzký hovor od našeho manažera."
    }
  }[lng];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(dict.greeting, () => {
        setStep('qualification');
      });
    }
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, messages]);

  const addBotMessage = (text: string, callback?: () => void, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', text }]);
      setIsTyping(false);
      if (callback) callback();
    }, delay);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text }]);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    
    if (step === 'qualification') {
      addBotMessage(dict.hook, () => {
        addBotMessage(dict.conversion, () => {
          setStep('conversion');
        }, 1500);
      });
    } else if (step === 'conversion') {
      addBotMessage(dict.lead, () => {
        setStep('lead');
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const source = formData.get('source') as string;

    setStep('success');

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, source }),
      });
    } catch (err) {
      console.error('Error submitting chat lead:', err);
    }
    
    addBotMessage(dict.success);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-transform hover:scale-110 flex items-center justify-center animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[350px] sm:w-[380px] h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 border border-gray-100">
          {/* Header */}
          <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold">Alser Assistant</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                  msg.type === 'user' 
                    ? 'bg-green-500 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Area */}
          <div className="p-4 bg-white border-t border-gray-100 min-h-[100px]">
            {step === 'qualification' && !isTyping && (
              <div className="flex flex-col gap-2">
                <button onClick={() => handleOptionClick(dict.options.blinds)} className="w-full text-left px-4 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
                  {dict.options.blinds}
                </button>
                <button onClick={() => handleOptionClick(dict.options.rollers)} className="w-full text-left px-4 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
                  {dict.options.rollers}
                </button>
                <button onClick={() => handleOptionClick(dict.options.curtains)} className="w-full text-left px-4 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
                  {dict.options.curtains}
                </button>
              </div>
            )}

            {step === 'conversion' && !isTyping && (
              <div className="flex flex-col gap-2">
                <button onClick={() => handleOptionClick(dict.dateOptions.tomorrow)} className="w-full text-left px-4 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
                  {dict.dateOptions.tomorrow}
                </button>
                <button onClick={() => handleOptionClick(dict.dateOptions.dayAfter)} className="w-full text-left px-4 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
                  {dict.dateOptions.dayAfter}
                </button>
              </div>
            )}

            {step === 'lead' && !isTyping && (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
                <input type="hidden" name="source" value={`Chatbot - ${lng.toUpperCase()}`} />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={dict.namePlaceholder}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder={dict.phonePlaceholder}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                />
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white font-medium py-2 rounded-lg hover:bg-black transition-colors flex justify-center items-center gap-2"
                >
                  {dict.submit}
                  <Send size={16} />
                </button>
              </form>
            )}

            {step === 'success' && !isTyping && (
              <div className="flex flex-col items-center justify-center text-center h-full text-green-500">
                <CheckCircle size={32} className="mb-2" />
              </div>
            )}

            {/* Waiting indicator when typing in middle steps */}
            {isTyping && step !== 'lead' && step !== 'success' && (
              <div className="text-center text-xs text-gray-400 py-4">
                ...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
