import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';
import HeroSection from '@/components/HeroSection';
import TrustBadges from '@/components/TrustBadges';
import ProductGrid from '@/components/ProductGrid';

export default async function Home({ params: { lng } }: { params: { lng: Locale } }) {
  const dictionary = await getDictionary(lng);

  return (
    <>
      <HeroSection dictionary={dictionary} />
      <TrustBadges dictionary={dictionary} />
      <ProductGrid dictionary={dictionary} lng={lng} />
    </>
  );
}
