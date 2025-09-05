# Deploy

## Netlify (aanbevolen)
1. Maak een site aan op Netlify en noteer:
   - **NETLIFY_SITE_ID**
   - **NETLIFY_AUTH_TOKEN** (User settings → Applications → New access token)
2. Op GitHub: Settings → Secrets and variables → Actions → **New repository secret**
   - Voeg **NETLIFY_SITE_ID** en **NETLIFY_AUTH_TOKEN** toe.
3. Push naar `main` of `master`. De workflow `.github/workflows/deploy-netlify.yml` deployt automatisch.

`netlify.toml` bevat security headers en caching.

## Domein
Stel bij je registrar (Combell) deze DNS-records in:
A  @   75.2.60.5
A  @   99.83.190.102
CNAME  www  your-site.netlify.app

## Formulier
In `contact.html`: vervang `YOUR_FORM_ID` door je Formspree ID (of gebruik enkel Netlify Forms).
