import { Helmet } from 'react-helmet-async'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'
const SITE_NAME = 'ClaimFlow'
const DEFAULT_DESCRIPTION =
  'ClaimFlow simplifies employee expense claims with secure receipt uploads, approval workflows, claim tracking, and centralized expense management.'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  noIndex = false,
  ogType = 'website',
  structuredData,
}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Employee Expense Claims Management`
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : null

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}
