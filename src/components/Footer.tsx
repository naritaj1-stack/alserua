import Link from 'next/link';
import { Locale } from '@/i18n-config';

export default function Footer({ lng }: { lng: Locale }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacts" className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href={`/${lng}`} className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-green-500 rounded-lg"></span>
              Alser
            </Link>
            <p className="text-sm text-gray-500">
              {lng === 'ua' 
                ? 'Провідний виробник сонцезахисних систем з багаторічним досвідом.'
                : 'Přední výrobce stínících systémů s dlouholetou zkušeností.'}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              {lng === 'ua' ? 'Каталог' : 'Katalog'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href={`/${lng}/#products`} className="hover:text-green-500">{lng === 'ua' ? 'Жалюзі' : 'Žaluzie'}</Link></li>
              <li><Link href={`/${lng}/#products`} className="hover:text-green-500">{lng === 'ua' ? 'Рулонні штори' : 'Rolety'}</Link></li>
              <li><Link href={`/${lng}/#products`} className="hover:text-green-500">{lng === 'ua' ? 'Штори' : 'Závěsy'}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              {lng === 'ua' ? 'Послуги' : 'Služby'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><span className="hover:text-green-500 cursor-pointer">{lng === 'ua' ? 'Безкоштовний замір' : 'Měření zdarma'}</span></li>
              <li><span className="hover:text-green-500 cursor-pointer">{lng === 'ua' ? 'Монтаж' : 'Montáž'}</span></li>
              <li><span className="hover:text-green-500 cursor-pointer">{lng === 'ua' ? 'Доставка' : 'Doprava'}</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              {lng === 'ua' ? 'Контакти' : 'Kontakty'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>{lng === 'ua' ? '+38 (044) 123-45-67' : '+420 123 456 789'}</li>
              <li>info@alser.{lng}</li>
              <li>{lng === 'ua' ? 'Щодня з 08:00 до 22:00' : 'Po-Pá 08:00 - 18:00'}</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
          <p>© {currentYear} Alser. {lng === 'ua' ? 'Всі права захищені.' : 'Všechna práva vyhrazena.'}</p>
        </div>
      </div>
    </footer>
  );
}
