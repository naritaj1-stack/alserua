'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Locale } from '@/i18n-config';
import { Menu, X, Phone } from 'lucide-react';

export default function Navbar({ lng }: { lng: Locale }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = (newLocale: string) => {
    const currentPathname = pathname;
    if (!currentPathname) return '/';
    const segments = currentPathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const navLinks = {
    ua: [
      { name: 'Товари', href: `/${lng}/#products` },
      { name: 'Що обрати?', href: `/${lng}/choose` },
      { name: 'Відстеження', href: `/${lng}/orders` },
      { name: 'Контакти', href: `/${lng}/#contacts` },
    ],
    cz: [
      { name: 'Produkty', href: `/${lng}/#products` },
      { name: 'Co vybrat?', href: `/${lng}/choose` },
      { name: 'Sledování', href: `/${lng}/orders` },
      { name: 'Kontakty', href: `/${lng}/#contacts` },
    ],
  }[lng];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={`/${lng}`} className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-500 rounded-lg"></span>
              Alser
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium hover:text-green-500 transition-colors ${
                  isScrolled ? 'text-gray-700' : 'text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Contacts & Language Switcher */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
              <Phone size={16} className="text-green-500" />
              <span>{lng === 'ua' ? '+38 (044) 123-45-67' : '+420 123 456 789'}</span>
            </div>
            
            <div className="flex items-center space-x-2 border-l pl-6 border-gray-300">
              <button
                onClick={() => switchLocale('ua')}
                className={`text-sm font-medium hover:text-green-500 ${
                  lng === 'ua' ? 'text-green-600 font-bold' : 'text-gray-500'
                }`}
              >
                UA
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => switchLocale('cz')}
                className={`text-sm font-medium hover:text-green-500 ${
                  lng === 'cz' ? 'text-green-600 font-bold' : 'text-gray-500'
                }`}
              >
                CZ
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-900 hover:text-green-500 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-xl absolute w-full left-0 top-full">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-green-500 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center px-3 py-2 text-gray-900 font-medium">
                <Phone size={16} className="text-green-500 mr-2" />
                <span>{lng === 'ua' ? '+38 (044) 123-45-67' : '+420 123 456 789'}</span>
              </div>
              <div className="flex space-x-4 px-3 py-4">
                <button
                  onClick={() => { switchLocale('ua'); setIsMenuOpen(false); }}
                  className={`text-sm font-medium hover:text-green-500 ${
                    lng === 'ua' ? 'text-green-600 font-bold' : 'text-gray-500'
                  }`}
                >
                  UKR
                </button>
                <button
                  onClick={() => { switchLocale('cz'); setIsMenuOpen(false); }}
                  className={`text-sm font-medium hover:text-green-500 ${
                    lng === 'cz' ? 'text-green-600 font-bold' : 'text-gray-500'
                  }`}
                >
                  CZE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
