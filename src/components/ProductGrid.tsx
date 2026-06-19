// @ts-nocheck
import { Locale } from '@/i18n-config';


export default function ProductGrid({ dictionary, lng }: { dictionary: Record<string, any>, lng: Locale }) {
  const products = [
    {
      id: 'rollers',
      title: dictionary.products.rollers,
      price: lng === 'ua' ? '450' : '300',
      image: '/images/rollers.jpg',
    },
    {
      id: 'blinds',
      title: dictionary.products.blinds,
      price: lng === 'ua' ? '350' : '250',
      image: '/images/blinds.jpg',
    },
    {
      id: 'curtains',
      title: dictionary.products.curtains,
      price: lng === 'ua' ? '800' : '500',
      image: '/images/curtains.jpg',
    },
    {
      id: 'roman',
      title: dictionary.products.roman,
      price: lng === 'ua' ? '650' : '400',
      image: '/images/roman.jpg',
    },
  ];

  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
          {dictionary.products.title}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <div className="relative h-64 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.title}</h3>
                <p className="text-green-600 font-medium">
                  {dictionary.common.priceFrom.replace('{{price}}', product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
