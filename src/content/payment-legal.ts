import { MERCHANT } from "./merchant";
import type { LegalDocument } from "./legal";

const contact = MERCHANT.email;
const legalName = MERCHANT.legalName;

export const TERMS_OF_SALE: LegalDocument = {
  id: "terms-of-sale",
  headerTitle: "UVJETI PRODAJE",
  cardTitle: "UVJETI PRODAJE I PRETPLATE",
  updated: "31. August 2026.",
  introParagraphs: [
    [
      "Ovi uvjeti uređuju naručivanje, plaćanje, aktivaciju i otkazivanje pretplata na ",
      { bold: MERCHANT.brandName },
      " digitalnu uslugu analize kože. Prodavatelj je ",
      { bold: legalName },
      ", a kupac je registrirani korisnik koji odabere plaćeni paket i izvrši uplatu karticom.",
    ],
  ],
  sections: [
    {
      title: "1. Podaci o trgovcu",
      blocks: [
        {
          kind: "bullets",
          items: [
            { label: "Naziv:", segments: [` ${legalName}`] },
            {
              label: "Adresa:",
              segments: [
                ` ${[MERCHANT.address, MERCHANT.city, MERCHANT.country].filter(Boolean).join(", ") || "bit će objavljena prije produkcije"}`,
              ],
            },
            {
              label: "PDV / JIB:",
              segments: [` ${MERCHANT.taxId || "bit će objavljen prije produkcije"}`],
            },
            {
              label: "Matični broj:",
              segments: [
                ` ${MERCHANT.companyNumber || "bit će objavljen prije produkcije"}`,
              ],
            },
            {
              label: "Sudski registar:",
              segments: [` ${MERCHANT.court || "bit će objavljen prije produkcije"}`],
            },
            {
              label: "E-mail:",
              segments: [
                " ",
                { link: { href: `mailto:${contact}`, text: contact } },
              ],
            },
            ...(MERCHANT.phone
              ? [
                  {
                    label: "Telefon:",
                    segments: [` ${MERCHANT.phone}`],
                  },
                ]
              : []),
            {
              label: "Web:",
              segments: [
                " ",
                {
                  link: {
                    href: `https://${MERCHANT.domain}`,
                    text: MERCHANT.domain,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "2. Usluga",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            MERCHANT.brandName,
            " je digitalna pretplata na mobilnu i web aplikaciju za AI analizu kože, dnevnik, metrike i (ovisno o paketu) personaliziranu rutinu. Usluga se isporučuje elektronički, odmah nakon uspješne naplate, aktivacijom odabranog paketa na korisničkom računu.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Dostupni paketi: Basic (besplatno), Plus i Premium. Cijene su izražene u konvertibilnoj marci (BAM / KM) i uključuju sve obvezne poreze ako je trgovac obveznik PDV-a. Nema troška dostave jer se ne šalje fizička roba.",
          ],
        },
      ],
    },
    {
      title: "3. Naručivanje",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Kupac odabire paket i interval naplate (mjesečno ili godišnje) na stranici paketa, pregleda sažetak narudžbe i potvrđuje suglasnost s ovim uvjetima. Narudžba se smatra zaprimljenom u trenutku uspješne autorizacije kartične transakcije.",
          ],
        },
      ],
    },
    {
      title: "4. Plaćanje",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Plaćanje se izvršava online karticama Visa, Mastercard® i Maestro® putem Monri WebPay platnog prometa. Broj kartice unosi se na sigurnoj Monri stranici; ",
            { bold: legalName },
            " ne pohranjuje brojeve kartica.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Sva plaćanja se terećuju u BAM. Iznos na izvodu kartice može biti prikazan u valuti kartice prema tečaju kartičnih kuća.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Nakon odobrenja transakcije pretplata se aktivira na računu kupca. Potvrda se prikazuje na web stranici; e-mail potvrdu možete zatražiti na ",
            { link: { href: `mailto:${contact}`, text: contact } },
            ".",
          ],
        },
      ],
    },
    {
      title: "5. Isporuka usluge",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Usluga je digitalna. Nakon uspješnog plaćanja kupac odmah dobiva pristup funkcijama odabranog paketa u mobilnoj aplikaciji i na webu. Nema fizičke dostave, carine ni troškova poštarine.",
          ],
        },
      ],
    },
    {
      title: "6. Trajanje i otkazivanje",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Pretplata vrijedi za plaćeno razdoblje (jedan mjesec ili jednu godinu). Kupac može otkazati obnovu u bilo kojem trenutku; pristup ostaje do isteka već plaćenog razdoblja.",
          ],
        },
      ],
    },
    {
      title: "7. Reklamacije i povrat",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Pravila povrata sredstava opisana su u dokumentu ",
            {
              link: {
                href: "/refund",
                text: "Povrat sredstava",
                internal: true,
              },
            },
            ". Povrat za uplate karticom vrši se isključivo na istu karticu storniranjem originalne transakcije.",
          ],
        },
      ],
    },
    {
      title: "8. Opće odredbe",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            legalName,
            " zadržava pravo izmjene ovih uvjeta. Kupac je odgovoran za točnost podataka unesenih pri plaćanju. Usluga ne uključuje troškove internetske veze ni uređaja.",
          ],
        },
      ],
    },
  ],
  seoTitle: "Uvjeti prodaje | MySkin Code",
  seoDescription:
    "Uvjeti prodaje i pretplate MySkin Code - naručivanje, kartično plaćanje, isporuka digitalne usluge i otkazivanje.",
};

export const REFUND_POLICY: LegalDocument = {
  id: "refund",
  headerTitle: "POVRAT SREDSTAVA",
  cardTitle: "POVRAT SREDSTAVA I REKLAMACIJE",
  updated: "31. August 2026.",
  introParagraphs: [
    [
      "Ovaj dokument objašnjava kako ",
      { bold: legalName },
      " postupa s odustajanjem od pretplate, reklamacijama i povratom novca za kartična plaćanja.",
    ],
  ],
  sections: [
    {
      title: "1. Digitalna usluga",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "MySkin Code je digitalna pretplata koja se aktivira odmah nakon uspješne naplate. Nema povrata fizičke robe.",
          ],
        },
      ],
    },
    {
      title: "2. Odustajanje i povrat",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Ako usluga nije aktivirana ili nije dostupna zbog greške na našoj strani, imate pravo na puni povrat uplaćenog iznosa. Zahtjev pošaljite na ",
            { link: { href: `mailto:${contact}`, text: contact } },
            " uz e-mail računa i broj narudžbe.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Ako je pretplata već aktivirana i korištena, povrat se razmatra pojedinačno. Otkazivanje pretplate zaustavlja buduće naplate; već plaćeno razdoblje ostaje dostupno do isteka.",
          ],
        },
      ],
    },
    {
      title: "3. Način povrata na karticu",
      blocks: [
        {
          kind: "note",
          label: "Obavezno:",
          segments: [
            " U slučaju vraćanja sredstava kupcu koji je prethodno platio karticom Visa, Mastercard® ili Maestro®, djelomično ili u cijelosti, a bez obzira na razlog, ",
            legalName,
            " je dužan povrat izvršiti isključivo preko Visa, Mastercard® i Maestro® metoda plaćanja, što znači da će banka na zahtjev trgovca obaviti povrat na račun korisnika kartice storniranjem originalne transakcije. Povrat se ne vrši gotovinom, virmanom na drugi račun ni drugim karticama.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Rok knjiženja povrata na izvodu kartice ovisi o banci izdavatelju kartice i obično iznosi 3 do 15 radnih dana nakon što Monri/banka obradi storno.",
          ],
        },
      ],
    },
    {
      title: "4. Reklamacije",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Tehničke smetnje, dvostruku naplatu ili neaktiviran paket prijavite na ",
            { link: { href: `mailto:${contact}`, text: contact } },
            ". Odgovaramo u roku od 5 radnih dana. Ako je greška na našoj strani, aktivirat ćemo paket ili izvršiti storno transakcije.",
          ],
        },
      ],
    },
  ],
  seoTitle: "Povrat sredstava | MySkin Code",
  seoDescription:
    "Pravila povrata i reklamacija za MySkin Code pretplate plaćene karticom Visa, Mastercard i Maestro.",
};

export const PAYMENT_SECURITY: LegalDocument = {
  id: "payment-security",
  headerTitle: "SIGURNOST PLAĆANJA",
  cardTitle: "SIGURNOST KARTIČNOG PLAĆANJA",
  updated: "31. August 2026.",
  sections: [
    {
      title: "Izjava o sigurnosti kupnje karticom",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Povjerljivost vaših podataka zaštićena je i osigurana korištenjem najnovije verzije TLS enkripcije. Stranice za online naplatu osigurane su protokolom Secure Socket Layer (SSL) sa 128-bitnom enkripcijom podataka. SSL enkripcija je postupak šifriranja podataka kako bi se spriječio neovlašteni pristup tijekom prijenosa.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Time se omogućuje siguran prijenos podataka i sprječava neovlašteni pristup tijekom komunikacije između korisnika i Monri WebPay Payment Gatewaya i obrnuto.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Monri WebPay Payment Gateway i financijske institucije razmjenjuju podatke koristeći vlastitu virtualnu privatnu mrežu (VPN) koja je također zaštićena od neovlaštenog pristupa.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Monri Payments je PCI DSS Level 1 certificirani pružatelj platnih usluga, reguliran pravilima Visa i Mastercard®.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Brojeve kreditnih kartica ne pohranjuje trgovac i nisu dostupni neovlaštenom osoblju.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Webshop koristi 3D Secure sigurnosni protokol, koji omogućuje dodatnu autentikaciju korisnika tijekom online plaćanja karticom, osiguravajući višu razinu zaštite transakcija kroz sustav vaše banke. Transakcije su sigurne uz Visa plaćanje. Koristimo Mastercard® Identity Check™.",
          ],
        },
      ],
    },
    {
      title: "Izjava o prikupljanju i zaštiti osobnih podataka",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Obvezujemo se štititi osobne podatke kupaca tako da prikupljamo samo osnovne podatke potrebne za izvršenje pretplate i zakonskih obveza. Kupce informiramo o načinu prikupljanja podataka i dajemo im izbor kako će se podaci koristiti, uključujući mogućnost da se njihovo ime ne nalazi na listama za marketinške kampanje.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Svi korisnički podaci strogo se čuvaju i dostupni su samo zaposlenicima kojima su potrebni za obavljanje posla. Svi zaposlenici i poslovni partneri dužni su poštovati načela zaštite povjerljivosti. Detalji su u ",
            {
              link: {
                href: "/privacy",
                text: "Politici privatnosti",
                internal: true,
              },
            },
            ".",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Ne pristajete na marketinške kampanje niti na ustupanje osobnih podataka trećim stranama u marketinške svrhe osim ako to izričito ne odobrite. Plaćanje obrađuje Monri Payments kao ovlašteni pružatelj platnih usluga.",
          ],
        },
      ],
    },
    {
      title: "Prihvaćene kartice",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Prihvaćamo kartice Visa, Mastercard® i Maestro®. Između Mastercard® i Maestro® nema drugih kartičnih brendova. Plaćanje se obavlja jednako, bez diskriminacije pojedine kartice.",
          ],
        },
      ],
    },
  ],
  seoTitle: "Sigurnost plaćanja | MySkin Code",
  seoDescription:
    "TLS/SSL i 3D Secure zaštita kartičnih plaćanja MySkin Code putem Monri WebPay, Visa Secure i Mastercard Identity Check.",
};
