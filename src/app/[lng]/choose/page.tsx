// @ts-nocheck
'use client';

import { useState } from 'react';
import { Locale } from '@/i18n-config';
import { ChevronRight, CheckCircle, ArrowLeft, Sparkles, Sun, Eye, Shield, Palette, Ruler, DollarSign } from 'lucide-react';
import Link from 'next/link';

type Step = 'room' | 'goal' | 'style' | 'budget' | 'result';

interface Answers {
  room: string;
  goal: string;
  style: string;
  budget: string;
}

const dict = {
  ua: {
    title: 'Що обрати?',
    subtitle: 'Дайте відповідь на кілька запитань, і ми підберемо ідеальне рішення для ваших вікон.',
    back: 'Назад',
    next: 'Далі',
    analyze: 'Аналізувати за допомогою ШІ',
    restart: 'Нове рішення',
    bookMeasurement: 'Замовити безкоштовний замір',
    resultTitle: 'РЕКОМЕНДАЦІЯ ШІ-АНАЛІТИКА',
    resultSubtitle: 'Оптимальний вибір на основі ваших відповідей',
    step1: {
      label: 'Крок 1',
      title: 'Тип приміщення',
      subtitle: 'Де ви плануєте встановити сонцезахист?',
      options: [
        { id: 'living', label: 'Вітальня', icon: '🛋️' },
        { id: 'bedroom', label: 'Спальня', icon: '🛏️' },
        { id: 'kitchen', label: 'Кухня', icon: '🍳' },
        { id: 'office', label: 'Офіс / Кабінет', icon: '💼' },
        { id: 'balcony', label: 'Балкон / Лоджія', icon: '🌿' },
        { id: 'children', label: 'Дитяча кімната', icon: '🧸' },
      ],
    },
    step2: {
      label: 'Крок 2',
      title: 'Основна мета',
      subtitle: 'Що для вас найважливіше?',
      options: [
        { id: 'sun', label: 'Захист від сонця', icon: '☀️' },
        { id: 'privacy', label: 'Приватність', icon: '🔒' },
        { id: 'decor', label: 'Декор інтер\'єру', icon: '🎨' },
        { id: 'blackout', label: 'Повне затемнення', icon: '🌙' },
        { id: 'energy', label: 'Енергозбереження', icon: '💚' },
        { id: 'noise', label: 'Шумоізоляція', icon: '🔇' },
      ],
    },
    step3: {
      label: 'Крок 3',
      title: 'Бажаний стиль',
      subtitle: 'Який стиль вам ближче?',
      options: [
        { id: 'minimalist', label: 'Мінімалізм', icon: '⬜' },
        { id: 'classic', label: 'Класика', icon: '🏛️' },
        { id: 'modern', label: 'Модерн', icon: '✨' },
        { id: 'scandinavian', label: 'Скандинавський', icon: '🌲' },
        { id: 'any', label: 'Будь-який', icon: '🤷' },
      ],
    },
    step4: {
      label: 'Крок 4',
      title: 'Бюджет',
      subtitle: 'Який рівень бюджету ви розглядаєте?',
      options: [
        { id: 'economy', label: 'Економ (до 3 000 грн)', icon: '💰' },
        { id: 'standard', label: 'Стандарт (3 000 – 8 000 грн)', icon: '💰💰' },
        { id: 'premium', label: 'Преміум (від 8 000 грн)', icon: '💰💰💰' },
        { id: 'any', label: 'Не має значення', icon: '✅' },
      ],
    },
    results: {
      'living-sun-minimalist': { product: 'Рулонні штори', reason: 'Ідеально підходять для вітальні: мінімалістичний вигляд, ефективний захист від сонця, легкість використання. Рекомендуємо тканину Screen — вона м\'яко розсіює світло, зберігаючи вид з вікна.' },
      'bedroom-blackout-classic': { product: 'Римські штори з тканиною Blackout', reason: 'Класичні римські штори з тканиною blackout забезпечать повне затемнення у спальні. Елегантні складки додають шарму інтер\'єру, а щільна тканина блокує 100% світла для здорового сну.' },
      'kitchen-sun-modern': { product: 'Рулонні штори з тканиною Screen', reason: 'Для кухні в сучасному стилі — рулонні штори ідеальні: компактні, легко чистяться, не збирають запахи. Тканина Screen захищає від сонця, не блокуючи денне світло.' },
      'office-privacy-minimalist': { product: 'Жалюзі вертикальні', reason: 'Вертикальні жалюзі — класичне офісне рішення: регулюйте рівень приватності та освітлення одним рухом. Мінімалістичний дизайн не відволікає від роботи.' },
      default: { product: 'Рулонні штори', reason: 'Універсальне рішення для будь-якого інтер\'єру. Понад 7000+ тканин дозволяють підібрати ідеальний варіант. Рекомендуємо замовити безкоштовний замір — наш експерт привезе зразки та допоможе з вибором.' },
    },
    criteria: [
      { name: 'Захист від сонця', icon: Sun },
      { name: 'Приватність', icon: Eye },
      { name: 'Довговічність', icon: Shield },
      { name: 'Естетика', icon: Palette },
      { name: 'Простота монтажу', icon: Ruler },
      { name: 'Ціна / якість', icon: DollarSign },
    ],
  },
  cz: {
    title: 'Co vybrat?',
    subtitle: 'Odpovězte na několik otázek a my vám doporučíme ideální řešení pro vaše okna.',
    back: 'Zpět',
    next: 'Další',
    analyze: 'Analyzovat pomocí AI',
    restart: 'Nové rozhodnutí',
    bookMeasurement: 'Objednat měření zdarma',
    resultTitle: 'DOPORUČENÍ AI ANALYTIKA',
    resultSubtitle: 'Optimální volba na základě vašich odpovědí',
    step1: {
      label: 'Krok 1',
      title: 'Typ místnosti',
      subtitle: 'Kde plánujete instalaci?',
      options: [
        { id: 'living', label: 'Obývací pokoj', icon: '🛋️' },
        { id: 'bedroom', label: 'Ložnice', icon: '🛏️' },
        { id: 'kitchen', label: 'Kuchyně', icon: '🍳' },
        { id: 'office', label: 'Kancelář', icon: '💼' },
        { id: 'balcony', label: 'Balkon', icon: '🌿' },
        { id: 'children', label: 'Dětský pokoj', icon: '🧸' },
      ],
    },
    step2: {
      label: 'Krok 2',
      title: 'Hlavní cíl',
      subtitle: 'Co je pro vás nejdůležitější?',
      options: [
        { id: 'sun', label: 'Ochrana před sluncem', icon: '☀️' },
        { id: 'privacy', label: 'Soukromí', icon: '🔒' },
        { id: 'decor', label: 'Dekorace interiéru', icon: '🎨' },
        { id: 'blackout', label: 'Úplné zatemnění', icon: '🌙' },
        { id: 'energy', label: 'Úspora energie', icon: '💚' },
        { id: 'noise', label: 'Izolace hluku', icon: '🔇' },
      ],
    },
    step3: {
      label: 'Krok 3',
      title: 'Preferovaný styl',
      subtitle: 'Jaký styl preferujete?',
      options: [
        { id: 'minimalist', label: 'Minimalismus', icon: '⬜' },
        { id: 'classic', label: 'Klasika', icon: '🏛️' },
        { id: 'modern', label: 'Moderní', icon: '✨' },
        { id: 'scandinavian', label: 'Skandinávský', icon: '🌲' },
        { id: 'any', label: 'Jakýkoli', icon: '🤷' },
      ],
    },
    step4: {
      label: 'Krok 4',
      title: 'Rozpočet',
      subtitle: 'Jaký rozpočet zvažujete?',
      options: [
        { id: 'economy', label: 'Ekonom (do 3 000 Kč)', icon: '💰' },
        { id: 'standard', label: 'Standard (3 000 – 8 000 Kč)', icon: '💰💰' },
        { id: 'premium', label: 'Premium (od 8 000 Kč)', icon: '💰💰💰' },
        { id: 'any', label: 'Nezáleží', icon: '✅' },
      ],
    },
    results: {
      default: { product: 'Rolety', reason: 'Univerzální řešení pro jakýkoli interiér. Široká nabídka materiálů vám umožní vybrat ideální variantu. Doporučujeme objednat měření zdarma — náš odborník přinese vzorky a pomůže s výběrem.' },
    },
    criteria: [
      { name: 'Ochrana před sluncem', icon: Sun },
      { name: 'Soukromí', icon: Eye },
      { name: 'Trvanlivost', icon: Shield },
      { name: 'Estetika', icon: Palette },
      { name: 'Snadná montáž', icon: Ruler },
      { name: 'Cena / kvalita', icon: DollarSign },
    ],
  },
};

function getRecommendation(answers: Answers, lng: Locale) {
  const d = dict[lng];
  const key = `${answers.room}-${answers.goal}-${answers.style}`;
  return d.results[key] || d.results.default;
}

function generateScores(answers: Answers) {
  const scoreMap: Record<string, Record<string, number>> = {
    'sun': { sun: 9, privacy: 5, durability: 7, aesthetic: 6, install: 8, value: 8 },
    'privacy': { sun: 5, privacy: 9, durability: 7, aesthetic: 6, install: 7, value: 7 },
    'decor': { sun: 5, privacy: 5, durability: 6, aesthetic: 9, install: 6, value: 6 },
    'blackout': { sun: 10, privacy: 10, durability: 8, aesthetic: 7, install: 7, value: 7 },
    'energy': { sun: 8, privacy: 6, durability: 8, aesthetic: 6, install: 7, value: 8 },
    'noise': { sun: 5, privacy: 7, durability: 7, aesthetic: 6, install: 6, value: 6 },
  };
  return scoreMap[answers.goal] || scoreMap['sun'];
}

export default function ChoosePage({ params: { lng } }: { params: { lng: Locale } }) {
  const d = dict[lng];
  const [step, setStep] = useState<Step>('room');
  const [answers, setAnswers] = useState<Answers>({ room: '', goal: '', style: '', budget: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const steps: Step[] = ['room', 'goal', 'style', 'budget', 'result'];
  const currentStepIndex = steps.indexOf(step);

  const selectOption = (field: keyof Answers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    if (step === 'budget') {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setStep('result');
      }, 2000);
    } else {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) setStep(steps[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setStep(steps[prevIndex]);
  };

  const restart = () => {
    setAnswers({ room: '', goal: '', style: '', budget: '' });
    setStep('room');
  };

  const canProceed = () => {
    if (step === 'room') return answers.room !== '';
    if (step === 'goal') return answers.goal !== '';
    if (step === 'style') return answers.style !== '';
    if (step === 'budget') return answers.budget !== '';
    return false;
  };

  const renderOptions = (options: { id: string; label: string; icon: string }[], field: keyof Answers) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => selectOption(field, opt.id)}
          className={`group relative p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
            answers[field] === opt.id
              ? 'border-green-500 bg-green-50 shadow-lg shadow-green-500/10'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">{opt.icon}</span>
            <span className={`text-base font-medium ${
              answers[field] === opt.id ? 'text-green-700' : 'text-gray-800'
            }`}>{opt.label}</span>
          </div>
          {answers[field] === opt.id && (
            <div className="absolute top-3 right-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
        </button>
      ))}
    </div>
  );

  const recommendation = getRecommendation(answers, lng);
  const scores = generateScores(answers);
  const scoreLabels = ['sun', 'privacy', 'durability', 'aesthetic', 'install', 'value'];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            AI COGNITIVE SUITE
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{d.title}</h1>
          <p className="text-gray-500 max-w-xl mx-auto">{d.subtitle}</p>
        </div>

        {/* Progress Bar */}
        {step !== 'result' && (
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {['room', 'goal', 'style', 'budget'].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : i === currentStepIndex
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {i < currentStepIndex ? <CheckCircle className="w-5 h-5" /> : i + 1}
                  </div>
                  {i < 3 && (
                    <div className={`w-12 sm:w-16 h-1 mx-1 rounded-full transition-all ${
                      i < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyzing Overlay */}
        {isAnalyzing && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {lng === 'ua' ? 'Аналізуємо дані...' : 'Analyzujeme data...'}
            </h3>
            <p className="text-gray-500 text-sm">
              {lng === 'ua' ? 'ШІ обробляє ваші відповіді для точної рекомендації' : 'AI zpracovává vaše odpovědi pro přesné doporučení'}
            </p>
          </div>
        )}

        {/* Step Content */}
        {!isAnalyzing && step !== 'result' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
            {step === 'room' && (
              <>
                <div className="mb-8">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{d.step1.label}</span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">{d.step1.title}</h2>
                  <p className="text-gray-500 mt-1">{d.step1.subtitle}</p>
                </div>
                {renderOptions(d.step1.options, 'room')}
              </>
            )}
            {step === 'goal' && (
              <>
                <div className="mb-8">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{d.step2.label}</span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">{d.step2.title}</h2>
                  <p className="text-gray-500 mt-1">{d.step2.subtitle}</p>
                </div>
                {renderOptions(d.step2.options, 'goal')}
              </>
            )}
            {step === 'style' && (
              <>
                <div className="mb-8">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{d.step3.label}</span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">{d.step3.title}</h2>
                  <p className="text-gray-500 mt-1">{d.step3.subtitle}</p>
                </div>
                {renderOptions(d.step3.options, 'style')}
              </>
            )}
            {step === 'budget' && (
              <>
                <div className="mb-8">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{d.step4.label}</span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">{d.step4.title}</h2>
                  <p className="text-gray-500 mt-1">{d.step4.subtitle}</p>
                </div>
                {renderOptions(d.step4.options, 'budget')}
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
              {currentStepIndex > 0 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {d.back}
                </button>
              ) : (
                <Link href={`/${lng}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  {d.back}
                </Link>
              )}
              <button
                onClick={goNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                  canProceed()
                    ? step === 'budget'
                      ? 'bg-gray-900 text-white hover:bg-black shadow-lg'
                      : 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/30'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {step === 'budget' ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {d.analyze}
                  </>
                ) : (
                  <>
                    {d.next}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {!isAnalyzing && step === 'result' && (
          <div className="space-y-6">
            {/* Main Recommendation */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-900 text-white p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-green-400">{d.resultTitle}</span>
                </div>
                <p className="text-gray-400 text-sm">{d.resultSubtitle}</p>
              </div>
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{recommendation.product}</h3>
                    <p className="text-gray-600 leading-relaxed">{recommendation.reason}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scores Table */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-500" />
                {lng === 'ua' ? 'Порівняльна матриця' : 'Srovnávací matice'}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="p-3 font-semibold text-gray-700">
                        {lng === 'ua' ? 'Критерій' : 'Kritérium'}
                      </th>
                      <th className="p-3 font-semibold text-gray-700 text-center">
                        {lng === 'ua' ? 'Оцінка' : 'Hodnocení'}
                      </th>
                      <th className="p-3 font-semibold text-gray-700 w-1/2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {d.criteria.map((criterion, i) => {
                      const score = Object.values(scores)[i] || 7;
                      const Icon = criterion.icon;
                      return (
                        <tr key={criterion.name} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-green-500" />
                              <span className="font-medium text-gray-800">{criterion.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block font-mono font-bold text-sm px-3 py-1 rounded-lg ${
                              score >= 8 ? 'bg-green-100 text-green-800' :
                              score >= 5 ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {score}/10
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-700 ${
                                  score >= 8 ? 'bg-green-500' :
                                  score >= 5 ? 'bg-amber-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${score * 10}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-lead-form'))}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600 transition-all shadow-lg hover:shadow-green-500/30"
              >
                {d.bookMeasurement}
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={restart}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                {d.restart}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
