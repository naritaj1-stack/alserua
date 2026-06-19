// @ts-nocheck
'use client';

import { useState } from 'react';
import { Locale } from '@/i18n-config';
import { Search, Loader2, Package, Calendar, Clock, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Order {
  phone: string;
  code: string;
  status: 'in_progress' | 'manufacturing' | 'completed' | 'delivering';
  statusText: string;
  dateMeasurement: string;
  datePrepayment: string;
  dateManufacturing: string;
  dateDelivery: string;
  createdAt: string;
}

const dict = {
  ua: {
    title: 'Відстеження замовлення',
    subtitle: 'Введіть номер телефону та секретний код замовлення для перевірки статусу в реальному часі.',
    phonePlaceholder: 'Номер телефону (наприклад: +380671112233)',
    codePlaceholder: 'Унікальний код замовлення (наприклад: AL-9482)',
    searchBtn: 'Відстежити',
    backHome: 'На головну',
    noOrdersTitle: 'Замовлення не знайдено',
    noOrdersDesc: 'Замовлення не знайдено. Будь ласка, перевірте дані або зверніться до оператора після внесення передплати.',
    errorTitle: 'Помилка пошуку',
    errorDesc: 'Будь ласка, введіть телефон та секретний код замовлення.',
    orderInfo: 'Інформація про замовлення',
    created: 'Створено',
    statusLabel: 'Поточний статус',
    tracking: 'Шлях замовлення',
    steps: {
      in_progress: { label: 'В роботі', desc: 'Замовлення прийнято, ведеться обробка та підготовка' },
      manufacturing: { label: 'Виготовлення', desc: 'Ваші сонцезахисні системи виготовляються на виробництві' },
      completed: { label: 'Виготовлення завершено', desc: 'Виготовлення замовлення успішно завершено' },
      delivering: { label: 'Доставляється', desc: 'Замовлення передано службі доставки і прямує до вас' },
    },
    stepNames: ['В роботі', 'Виготовлення', 'Завершено', 'Доставляється'],
    dates: {
      measurement: 'Дата заміру',
      prepayment: 'Дата передплати',
      manufacturing: 'Дата виготовлення',
      delivery: 'Очікувана дата доставки/монтажу',
      created: 'Дата створення заявки',
    },
  },
  cz: {
    title: 'Sledování objednávky',
    subtitle: 'Pro sledování stavu v reálném čase zadejte své telefonní číslo a tajný kód objednávky.',
    phonePlaceholder: 'Telefonní číslo (např. +420 123 456 789)',
    codePlaceholder: 'Unikátní kód objednávky (např. AL-9482)',
    searchBtn: 'Sledovat',
    backHome: 'Zpět na hlavní',
    noOrdersTitle: 'Objednávka nebyla nalezena',
    noOrdersDesc: 'Objednávka nebyla nalezena. Zkontrolujte prosím údaje nebo se obraťte na operátora po zaplacení zálohy.',
    errorTitle: 'Chyba vyhledávání',
    errorDesc: 'Zadejte prosím telefonní číslo a tajný kód objednávky.',
    orderInfo: 'Informace o objednávce',
    created: 'Vytvořeno',
    statusLabel: 'Aktuální stav',
    tracking: 'Sledování objednávky',
    steps: {
      in_progress: { label: 'Na zpracování', desc: 'Objednávka byla přijata a zpracovává se' },
      manufacturing: { label: 'Výroba', desc: 'Vaše stínící systémy se vyrábí v naší dílně' },
      completed: { label: 'Výroba dokončena', desc: 'Výroba objednávky byla úspěšně dokončena' },
      delivering: { label: 'Na cestě k vám', desc: 'Objednávka byla předána doručovací službě a je na cestě k vám' },
    },
    stepNames: ['Na zpracování', 'Výroba', 'Dokončena', 'Na cestě k vám'],
    dates: {
      measurement: 'Datum měření',
      prepayment: 'Datum zálohy',
      manufacturing: 'Datum výroby',
      delivery: 'Předpokládané datum dodání/montáže',
      created: 'Datum vytvoření objednávky',
    },
  },
};

const statusOrder = ['in_progress', 'manufacturing', 'completed', 'delivering'];

export default function OrdersPage({ params: { lng } }: { params: { lng: Locale } }) {
  const d = dict[lng];
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !code.trim()) {
      setErrorMsg(d.errorDesc);
      return;
    }

    setIsLoading(true);
    setSearched(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone.trim())}&code=${encodeURIComponent(code.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || d.errorDesc);
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(d.errorDesc);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = (status: string) => {
    return statusOrder.indexOf(status);
  };

  // Build array of date entries to display (only non-empty ones)
  const getDateEntries = (order: Order) => {
    const entries: { label: string; value: string }[] = [];
    if (order.dateMeasurement)    entries.push({ label: d.dates.measurement, value: order.dateMeasurement });
    if (order.datePrepayment)     entries.push({ label: d.dates.prepayment, value: order.datePrepayment });
    if (order.dateManufacturing)  entries.push({ label: d.dates.manufacturing, value: order.dateManufacturing });
    if (order.dateDelivery)       entries.push({ label: d.dates.delivery, value: order.dateDelivery });
    if (order.createdAt)          entries.push({ label: d.dates.created, value: order.createdAt });
    return entries;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-4">
            <Package className="w-4 h-4" />
            ORDER REAL-TIME TRACKING
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{d.title}</h1>
          <p className="text-gray-500 max-w-xl mx-auto">{d.subtitle}</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Field */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  id="tracking-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={d.phonePlaceholder}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-base text-gray-900 shadow-sm"
                />
              </div>
              {/* Secret Code Field */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  id="tracking-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={d.codePlaceholder}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-base text-gray-900 shadow-sm"
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="tracking-submit"
                disabled={isLoading}
                className="w-full md:w-auto px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {lng === 'ua' ? 'Шукаємо...' : 'Hledám...'}
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    {d.searchBtn}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="bg-red-50 rounded-2xl p-6 border border-red-100 text-center text-red-700">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold mb-1">{d.errorTitle}</h3>
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && searched && !errorMsg && (
          <div className="space-y-8">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{d.noOrdersTitle}</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">{d.noOrdersDesc}</p>
              </div>
            ) : (
              orders.map((order) => {
                const currentStep = getStepProgress(order.status);
                const dateEntries = getDateEntries(order);

                return (
                  <div key={order.code} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    
                    {/* Card Header */}
                    <div className="bg-gray-950 text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold tracking-tight">{order.code}</h3>
                          {order.createdAt && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {d.created}: {order.createdAt}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                          {d.steps[order.status]?.label || order.statusText || order.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 md:p-8 space-y-8">
                      {/* Step Progress Tracker */}
                      {currentStep !== -1 && (
                        <div className="relative pt-4 pb-8">
                          {/* Progress Line */}
                          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0">
                            <div 
                              className="h-full bg-green-500 transition-all duration-700" 
                              style={{ width: `${(currentStep / 3) * 100}%` }}
                            ></div>
                          </div>

                          {/* Steps Circles */}
                          <div className="relative z-10 flex justify-between">
                            {d.stepNames.map((stepName, index) => {
                              const isCompleted = index < currentStep;
                              const isActive = index === currentStep;
                              
                              return (
                                <div key={stepName} className="flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                    isCompleted 
                                      ? 'bg-green-500 border-green-500 text-white' 
                                      : isActive
                                      ? 'bg-white border-gray-900 text-gray-900 ring-4 ring-gray-100'
                                      : 'bg-white border-gray-200 text-gray-400'
                                  }`}>
                                    {isCompleted ? '✓' : index + 1}
                                  </div>
                                  <span className={`text-xs font-semibold mt-3 text-center transition-colors hidden sm:block ${
                                    isActive ? 'text-gray-900 font-bold' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                  }`}>
                                    {stepName}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Status Details */}
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-4">
                        <Clock className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-gray-950 text-base">{d.steps[order.status]?.label || order.statusText || order.status}</h4>
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{d.steps[order.status]?.desc || ''}</p>
                        </div>
                      </div>

                      {/* Dynamic Dates Section */}
                      {dateEntries.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                          {dateEntries.map((entry) => (
                            <div key={entry.label} className="flex items-center justify-between px-5 py-3.5">
                              <span className="text-sm text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {entry.label}
                              </span>
                              <span className="text-sm font-semibold text-gray-900">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Back navigation */}
        <div className="mt-12 text-center">
          <Link
            href={`/${lng}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {d.backHome}
          </Link>
        </div>

      </div>
    </div>
  );
}
