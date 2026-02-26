import AnimatedPage from '../components/common/AnimatedPage';
import SEO from '../components/common/SEO';
import Hero from '../components/home/Hero';
import FeaturedWorks from '../components/home/FeaturedWorks';
import CategoriesGrid from '../components/home/CategoriesGrid';
import CustomOrderCTA from '../components/home/CustomOrderCTA';
import Testimonials from '../components/home/Testimonials';
import ArtistStory from '../components/home/ArtistStory';

export default function Home() {
  return (
    <AnimatedPage>
      <SEO path="/" />
      {/* Full-viewport hero with per-character GSAP animation and parallax */}
      <Hero />

      {/* Swiper carousel of featured paintings with tilt-on-hover cards */}
      <FeaturedWorks />

      {/* Category exploration grid with stagger reveal */}
      <CategoriesGrid />

      {/* Custom commission CTA with animated easel illustration */}
      <CustomOrderCTA />

      {/* Auto-rotating testimonial cards */}
      <Testimonials />

      {/* Artist story with parallax and animated stat counters */}
      <ArtistStory />
    </AnimatedPage>
  );
}
