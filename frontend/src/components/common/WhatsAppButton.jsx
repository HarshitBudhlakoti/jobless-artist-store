import { useSiteSettings } from '../../hooks/useSiteContent';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppButton() {
  const { data: settings, loading } = useSiteSettings();
  const whatsapp = settings?.socialLinks?.whatsapp;

  if (loading || !whatsapp) return null;

  // Strip non-digits for the wa.me link
  const phoneClean = whatsapp.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent('Hi! I have a question about Jobless Artist.')}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
    >
      <FaWhatsapp className="h-7 w-7" />
    </a>
  );
}
