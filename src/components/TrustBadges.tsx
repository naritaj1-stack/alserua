// @ts-nocheck
import { Clock, ShieldCheck, Layers } from 'lucide-react';

export default function TrustBadges({ dictionary }: { dictionary: Record<string, any> }) {
  const badges = [
    {
      icon: <Clock className="w-8 h-8 text-green-500 mb-3" />,
      title: dictionary.trust.production,
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-green-500 mb-3" />,
      title: dictionary.trust.guarantee,
    },
    {
      icon: <Layers className="w-8 h-8 text-green-500 mb-3" />,
      title: dictionary.trust.materials,
    },
  ];

  return (
    <section className="bg-white py-12 relative z-20 -mt-10 mx-4 sm:mx-auto max-w-5xl rounded-2xl shadow-xl border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {badges.map((badge, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-6 text-center group">
            <div className="transform group-hover:-translate-y-2 transition-transform duration-300">
              {badge.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{badge.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
