export type RichSegment =
  | string
  | { bold: string }
  | { link: { href: string; text: string; internal?: boolean } };

export type LegalBullet = {
  label?: string;
  segments: RichSegment[];
};

export type LegalBlock =
  | { kind: "paragraph"; segments: RichSegment[] }
  | { kind: "bullets"; items: LegalBullet[] }
  | { kind: "note"; label: string; segments: RichSegment[] };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  id: "privacy" | "terms";
  headerTitle: string;
  cardTitle: string;
  updated?: string;
  intro?: RichSegment[];
  introParagraphs?: RichSegment[][];
  sections: LegalSection[];
  seoTitle: string;
  seoDescription: string;
};

export const PRIVACY_POLICY: LegalDocument = {
  id: "privacy",
  headerTitle: "POLITIKA PRIVATNOSTI",
  cardTitle: "POLITIKA PRIVATNOSTI",
  updated: "9. August 2026.",
  intro: [
    "Vaša privatnost nam je izuzetno važna. Ova Politika privatnosti objašnjava kako ",
    { bold: "MySkin Code" },
    " prikuplja, koristi, pohranjuje, dijeli i briše vaše podatke prilikom analize kože i preporuke rutina.",
  ],
  sections: [
    {
      title: "1. Podaci koje prikupljamo",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Kako bismo vam pružili uslugu analize kože, prikupljamo sljedeće kategorije podataka:",
          ],
        },
        {
          kind: "bullets",
          items: [
            {
              label: "Fotografije lica (face data):",
              segments: [
                " Fotografije koje snimate kamerom ili odaberete iz galerije unutar aplikacije radi analize kože. Detekcija lica na uređaju koristi se samo za poravnavanje kadra i ne šalje biometrijske predloške (npr. Face ID).",
              ],
            },
            {
              label: "Informacije o tipu kože:",
              segments: [
                " Podaci koje sami unesete (npr. dob, tip kože, alergije, brige o koži).",
              ],
            },
            {
              label: "Podaci računa:",
              segments: [
                " E-mail i osnovni identifikatori računa potrebni za prijavu i pohranu rezultata.",
              ],
            },
            {
              label: "Tehnički podaci:",
              segments: [
                " Informacije o uređaju, operativnom sustavu i stabilnosti aplikacije (radi poboljšanja rada).",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "2. Kako koristimo vaše fotografije i face podatke?",
      blocks: [
        {
          kind: "paragraph",
          segments: ["Vaše fotografije lica koriste se isključivo za:"],
        },
        {
          kind: "bullets",
          items: [
            {
              segments: [
                "Analizu vizualnih znakova stanja kože (npr. akne, pore, bore, pigmentacije).",
              ],
            },
            {
              segments: [
                "Generiranje personaliziranih preporuka rutine njege.",
              ],
            },
            {
              segments: [
                "Praćenje napretka kroz Dnevnik (ako spremite ili zadržite rezultate analize).",
              ],
            },
          ],
        },
        {
          kind: "note",
          label: "Važno:",
          segments: [
            " Fotografije se ne koriste u marketinške svrhe, ne prodaju se i ne koriste za oglašavanje.",
          ],
        },
      ],
    },
    {
      title: "3. Pohrana, zadržavanje i brisanje",
      blocks: [
        {
          kind: "bullets",
          items: [
            {
              label: "Pohrana:",
              segments: [
                " Fotografije i rezultati analize šalju se na naše sigurne cloud servere (AWS, regija EU — eu-central-1) i pohranjuju u kriptiranom obliku.",
              ],
            },
            {
              label: "Zadržavanje:",
              segments: [
                " Face podaci i povezani rezultati zadržavaju se dok postoji odgovarajući unos u Dnevniku ili dok postoji vaš račun — ovisno o tome što dulje traje.",
              ],
            },
            {
              label: "Brisanje:",
              segments: [
                " Možete obrisati pojedinačne analize u Dnevniku ili trajno obrisati račun (Profil), čime se uklanjaju povezane fotografije i rezultati iz našeg sustava.",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "4. Dijeljenje podataka s trećim stranama",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Osobne podatke dijelimo samo kad je to potrebno za pružanje usluge ili kad to nalaže zakon:",
          ],
        },
        {
          kind: "bullets",
          items: [
            {
              label: "AI pružatelji usluga (procesori):",
              segments: [
                " Za analizu kože i preporuke rutine fotografija lica (i potrebni identifikatori obrade) šalje se nezavisnim AI pružateljima usluga koje angažiramo isključivo kao procesore. Oni smiju obrađivati podatke samo u naše ime, za navedene svrhe, uz ugovornu obvezu jednake ili odgovarajuće razine zaštite. Prije prvog slanja tražimo vašu izričitu privolu unutar aplikacije.",
              ],
            },
            {
              label: "Infrastruktura:",
              segments: [
                " Cloud hosting i povezane tehničke usluge (npr. AWS) za pohranu i obradu.",
              ],
            },
            {
              label: "Analitički partneri:",
              segments: [
                " (Npr. Firebase) za stabilnost i dijagnostiku aplikacije — ne za prodaju face podataka.",
              ],
            },
            {
              label: "Pravna obveza:",
              segments: [" Ako to nalaže zakon."],
            },
          ],
        },
      ],
    },
    {
      title: "5. Privola za AI obradu",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Prije dijeljenja fotografije lica s AI pružateljima usluga aplikacija traži vašu privolu. Bez privole AI analiza se ne pokreće. Privolu možete povući brisanjem analiza ili računa; nove analize tada nećemo slati dok ponovno ne date privolu.",
          ],
        },
      ],
    },
    {
      title: "6. Vaša prava (GDPR i slični zakoni)",
      blocks: [
        {
          kind: "paragraph",
          segments: ["U svakom trenutku imate pravo:"],
        },
        {
          kind: "bullets",
          items: [
            { segments: ["Pristupiti svojim podacima koje čuvamo."] },
            { segments: ["Zatražiti ispravak netočnih podataka."] },
            {
              segments: [
                "Zatražiti brisanje svih vaših podataka i fotografija iz našeg sustava (opcija „Obriši račun“ unutar aplikacije).",
              ],
            },
            {
              segments: [
                "Povući privolu za obradu fotografija u bilo kojem trenutku.",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "7. Kolačići i praćenje",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Aplikacija može koristiti identifikatore uređaja za personalizaciju sadržaja i analizu prometa, što nam pomaže da preporuke rutina budu što preciznije. Ne koristimo face podatke za praćenje oglašavanja.",
          ],
        },
      ],
    },
    {
      title: "8. Kontakt",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Za sva pitanja u vezi s vašim podacima, možete nas kontaktirati na: ",
            {
              link: {
                href: "mailto:info@myskincodeapp.com",
                text: "info@myskincodeapp.com",
              },
            },
            ".",
          ],
        },
      ],
    },
  ],
  seoTitle: "Politika privatnosti | MySkin Code",
  seoDescription:
    "Politika privatnosti MySkin Code aplikacije — kako prikupljamo, koristimo, pohranjujemo i štitimo vaše podatke prilikom analize kože.",
};

export const TERMS_OF_USE: LegalDocument = {
  id: "terms",
  headerTitle: "UVJETI I ODREDBE",
  cardTitle: "UVJETI I ODREDBE KORIŠTENJA APLIKACIJE",
  introParagraphs: [
    [
      "Dobrodošli u MySkin Code. Korištenjem ove aplikacije pristajete na sljedeće uvjete i odredbe. Molimo vas da ih pažljivo pročitate prije početka korištenja.",
    ],
  ],
  sections: [
    {
      title: "1. Odricanje od medicinske odgovornosti",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Sadržaj i funkcionalnosti ove aplikacije, uključujući analizu kože putem kamere/fotografija i preporučene rutine njege, služe isključivo u ",
            { bold: "informativne i edukativne svrhe" },
            ".",
          ],
        },
        {
          kind: "bullets",
          items: [
            {
              label: "Nije medicinski savjet",
              segments: [
                ": Analiza koju pruža aplikacija nije medicinska dijagnoza, liječnički nalaz niti stručno mišljenje dermatologa.",
              ],
            },
            {
              label: "Konzultacije s liječnikom",
              segments: [
                ": Preporuke aplikacije ne smiju zamijeniti profesionalni medicinski savjet. Uvijek se obratite kvalificiranom dermatologu ili liječniku prije uvođenja novih preparata, posebno ako imate specifična stanja kože, alergije ili koristite propisanu terapiju.",
              ],
            },
            {
              label: "Hitni slučajevi",
              segments: [
                ": Ako sumnjate na ozbiljne zdravstvene probleme (npr. promjene na mladežima koje krvare ili brzo rastu), odmah potražite stručnu pomoć.",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "2. Korištenje aplikacije i rezultati",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Aplikacija koristi algoritme za analizu vizualnih podataka koje dostavlja korisnik. Preciznost analize ovisi o kvaliteti fotografije, osvjetljenju i drugim faktorima.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Korisnik prihvaća da rezultati analize mogu varirati i da aplikacija ne jamči specifične estetske ili zdravstvene rezultate.",
          ],
        },
        {
          kind: "paragraph",
          segments: [
            "Korištenje preporučenih proizvoda i rutina radite na vlastitu odgovornost.",
          ],
        },
      ],
    },
    {
      title: "3. Privatnost i podaci",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Vaša privatnost nam je prioritet. S obzirom na to da aplikacija analizira fotografije vašeg lica:",
          ],
        },
        {
          kind: "bullets",
          items: [
            {
              segments: [
                "Svi podaci obrađuju se u skladu s našom ",
                {
                  link: {
                    href: "/privacy",
                    text: "Politikom privatnosti",
                    internal: true,
                  },
                },
                ".",
              ],
            },
            {
              segments: [
                "Korisnik daje suglasnost aplikaciji za pristup kameri i pohrani fotografija isključivo u svrhu analize i praćenja napretka kože.",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "4. Ograničenje odgovornosti",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            { bold: "MySkin Code" },
            ", njezini vlasnici i programeri neće biti odgovorni za bilo kakvu štetu, iritacije kože, alergijske reakcije ili druge neželjene efekte nastale upotrebom preporučenih rutina ili proizvoda. Korisnik je dužan provjeriti sastav svakog proizvoda prije nanošenja.",
          ],
        },
      ],
    },
    {
      title: "5. Dobna granica",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Korištenje aplikacije dopušteno je osobama starijim od 18 godina (ili uz suglasnost roditelja/skrbnika, ovisno o lokalnim zakonima).",
          ],
        },
      ],
    },
    {
      title: "6. Izmjene uvjeta",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "Zadržavamo pravo izmjene ovih Uvjeta u bilo kojem trenutku. Nastavak korištenja aplikacije nakon promjena podrazumijeva vaše prihvaćanje novih uvjeta.",
          ],
        },
      ],
    },
  ],
  seoTitle: "Uvjeti i odredbe | MySkin Code",
  seoDescription:
    "Uvjeti i odredbe korištenja MySkin Code aplikacije za analizu kože i preporuku rutina njege.",
};
