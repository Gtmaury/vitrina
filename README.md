# Vitrina

Vitrina is a counter for a local shop. You price an offer, keep the cost and margin on your side of the counter, and leave with a customer message plus a square card.

It is built for the way small shops in Latin America already sell: people find the offer on Instagram, Threads, or LinkedIn, then close it on WhatsApp. Mauricio González’s portfolio already has the sites — café, beauty, clinic, retail, paint. This is the piece the owner uses the day there is a price.

## What it does

- Line items with quantity, private cost, and customer price
- General 2026 VAT presets (Venezuela, Mexico and its border rate, Colombia, Chile, Argentina, Peru, Ecuador, Paraguay, Uruguay) or a custom percent
- Discount, and a switch for prices that already include tax
- Margin that never appears in the customer copy or the card
- Copy for WhatsApp, Instagram, Threads, and LinkedIn, with each network’s character limit
- A downloadable 1080×1080 card in paper, ink, or clinic styles
- Today’s Venezuela rates: official BCV dollar, street dollar, and official BCV euro, with a dollar or euro offer total in bolívares
- A shareable link and local save in the browser

The bolívar figure uses [DolarApi](https://dolarapi.com/docs/venezuela/) (`/v1/dolares` and `/v1/euros`). The street dollar is the default for a dollar offer. A euro offer uses the official BCV euro. The offer link does not freeze the rate; the page reads it again when someone opens it.

Examples are fictional shops, not client work.

## Run it

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847).

```bash
npm test
npm run lint
```

## Share it

The copy below is ready for Mauricio’s channels. Replace the link with the public address once the deployment is claimed.

**LinkedIn / Facebook**

Armé Vitrina, una herramienta de mostrador.

Sirve para el día en que un café, una clínica o una tienda ya tiene el precio: se arma la oferta, el margen se queda del lado del negocio, y salen el mensaje de WhatsApp y la tarjeta para Instagram, Threads o LinkedIn.

**Instagram / Threads**

Vitrina: cotiza la oferta y publica el mensaje.

El costo no sale en la tarjeta. El total sí.

## Sources for the product choice

- Sebrae, 12th Pulso dos Pequenos Negócios, February–March 2026, more than 8,200 entrepreneurs in Brazil: 82% use WhatsApp to sell or talk to customers, 57% use Instagram, 30% use Facebook. Coverage: [Conecta Mídia](https://conectamidia.net/2026/04/30/pequenos-negocios-ampliam-vendas-on-line-com-o-whatsapp/).
- International Chamber of Commerce on Latin American MSMEs: WhatsApp, Mercado Libre, Instagram, and Facebook Marketplace are the main digital sales tools. [Report note](https://iccwbo.org/news-publications/policies-reports/msmes-digital-exports-in-latin-america/).

Tax presets are general statutory rates, not advice for a specific business.
