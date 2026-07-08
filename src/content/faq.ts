export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  description: string;
  items: readonly FaqItem[];
};

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  {
    id: "app",
    title: "Aplikacija i analiza",
    description: "Kako MySkin Code radi i što možete očekivati od AI analize.",
    items: [
      {
        question: "Kako AI analiza kože funkcionira?",
        answer:
          "MySkin Code koristi naprednu AI tehnologiju za analizu fotografije vašeg lica. Algoritam procjenjuje teksturu, ton, hidrataciju i druge parametre kako bi vam pružio personalizirane preporuke njege.",
      },
      {
        question: "Koliko često trebam skenirati lice?",
        answer:
          "Preporučujemo tjedno skeniranje kako biste pratili napredak. U Plus i Premium paketima možete skenirati češće za detaljnije praćenje promjena.",
      },
      {
        question: "Trebam li posebnu opremu za skeniranje?",
        answer:
          "Dovoljan je smartphone s kamerom i dobro osvjetljenje. Za najbolje rezultate koristite prirodno svjetlo i držite lice u okviru vodiča u aplikaciji.",
      },
      {
        question: "Što je barkod skener proizvoda?",
        answer:
          "Skeniranjem barkoda proizvoda možete brzo provjeriti sastojke i usporediti proizvod s preporukama za vašu kožu. Dostupno u svim paketima.",
      },
    ],
  },
  {
    id: "plans",
    title: "Pretplate i paketi",
    description: "Basic, Plus i Premium — što dobivate i kako promijeniti plan.",
    items: [
      {
        question: "Mogu li promijeniti paket kasnije?",
        answer:
          "Da, paket možete nadograditi ili promijeniti u bilo kojem trenutku. Promjene stupaju na snagu odmah ili na kraju trenutnog obračunskog razdoblja, ovisno o načinu naplate.",
      },
      {
        question: "Koja je razlika između Plus i Premium?",
        answer:
          "Plus nudi naprednu analizu i ključne metrike. Premium dodatno omogućava pokretanje personalizirane rutine, praćenje napretka kroz kalendar i graf, preporučene proizvode te prilagodbu rutine nakon tretmana.",
      },
      {
        question: "Mogu li otkazati pretplatu?",
        answer:
          "Da. Pretplatu možete otkazati bilo kada. Nakon otkazivanja zadržavate pristup do kraja plaćenog razdoblja.",
      },
      {
        question: "Postoji li godišnja pretplata?",
        answer:
          "Da. Plus i Premium dostupni su mjesečno ili godišnje, s uštedom u odnosu na 12 mjesečnih uplata.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privatnost i podaci",
    description: "Sigurnost vaših podataka i kontrola nad profilom.",
    items: [
      {
        question: "Jesu li moji podaci privatni i sigurni?",
        answer:
          "Da. Vaši podaci su enkriptirani i pohranjeni u skladu s GDPR propisima. Nikada ne dijelimo vaše podatke s trećim stranama bez vašeg pristanka.",
      },
      {
        question: "Gdje se pohranjuju fotografije lica?",
        answer:
          "Fotografije se obrađuju u svrhu analize i čuvaju u skladu s našom politikom privatnosti. Detalje možete pročitati u dokumentu Politika privatnosti.",
      },
      {
        question: "Mogu li izbrisati svoj račun?",
        answer:
          "Da. Brisanje računa i povezanih podataka možete zatražiti putem aplikacije ili kontaktiranjem support tima.",
      },
    ],
  },
  {
    id: "routine",
    title: "Rutina i proizvodi",
    description: "Personalizirana njega, rutina i preporuke proizvoda.",
    items: [
      {
        question: "Kada mogu pokrenuti personaliziranu rutinu?",
        answer:
          "Pokretanje aktivne rutine, dnevno praćenje i kalendar napretka dostupni su u Premium paketu. Plus nudi naprednu analizu bez aktivnog praćenja rutine u aplikaciji.",
      },
      {
        question: "Odakle dolaze preporučeni proizvodi?",
        answer:
          "Preporuke temelje se na analizi vaše kože, tipu kože i odabranim ciljevima. Proizvodi u bazi imaju strukturirane podatke (kategorija, step_type, concerns) za precizno uparivanje.",
      },
      {
        question: "Mogu li koristiti vlastite proizvode u rutini?",
        answer:
          "Aplikacija vam pomaže sastaviti rutinu prema koracima njege. Preporučene proizvode možete zamijeniti vlastitima, ali za najbolje rezultate slijedite preporučene sastojke i tip koraka.",
      },
    ],
  },
] as const;

/** Ravna lista za landing preview (prva pitanja iz svake kategorije). */
export const FAQ_LANDING_PREVIEW: readonly FaqItem[] = FAQ_CATEGORIES.flatMap(
  (category) => category.items.slice(0, 1),
);

export const FAQ_SUPPORT_EMAIL = "support@myskincode.com";
