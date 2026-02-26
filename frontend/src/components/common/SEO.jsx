import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Jobless Artist';
const BASE_URL = 'https://jobless-artist-store.netlify.app';
const DEFAULT_DESCRIPTION =
  'Discover unique handcrafted art pieces, custom paintings, and personalized commissions by Jobless Artist.';

export default function SEO({ title, description, path = '', type = 'website' }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Handcrafted Art & Custom Paintings`;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}
