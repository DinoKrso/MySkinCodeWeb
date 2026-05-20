export type LegalSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  note?: string;
};

export type LegalDocument = {
  id: "privacy" | "terms";
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  id: "privacy",
  title: "Politika privatnosti",
  updated: "15. Januar 2026.",
  intro:
    "Vaša privatnost nam je izuzetno važna. Ova Politika privatnosti objašnjava kako MySkin Code prikuplja, koristi i štiti vaše podatke prilikom analize kože i preporuke rutina.",
  sections: [
    {
      title: "1. Podaci koje prikupljamo",
      paragraphs: [
        "Kako bismo vam pružili uslugu analize kože, prikupljamo sljedeće kategorije podataka:",
      ],
      list: [
        "Fotografije lica: Koje učitavate ili snimate unutar aplikacije.",
        "Informacije o tipu kože: Podaci koje sami unesete (npr. dob, tip kože, alergije).",
        "Tehnički podaci: Informacije o vašem uređaju, operativnom sustavu i načinu interakcije s aplikacijom (u svrhu poboljšanja rada aplikacije).",
      ],
    },
    {
      title: "2. Kako koristimo vaše fotografije?",
      paragraphs: ["Vaše fotografije se koriste isključivo za:"],
      list: [
        "Pokretanje algoritma za detekciju stanja kože (akne, crvenilo, bore, itd.).",
        "Praćenje napretka vaše kože kroz vrijeme (ako odaberete opciju spremanja povijesti).",
      ],
      note: "Važno: Vaše fotografije se ne koriste u marketinške svrhe niti se prodaju trećim stranama bez vaše izričite privole.",
    },
    {
      title: "3. Pohrana i sigurnost podataka",
      list: [
        "Cloud pohrana: Slike se šalju na naše sigurne servere radi obrade i pohranjuju u kriptiranom obliku.",
        "Primjenjujemo najsuvremenije sigurnosne mjere kako bismo spriječili neovlašten pristup vašim biometrijskim podacima.",
      ],
    },
    {
      title: "4. Dijeljenje podataka s trećim stranama",
      paragraphs: [
        "Vaše osobne podatke ne dijelimo s trećim stranama, osim u sljedećim slučajevima:",
      ],
      list: [
        "Analitički partneri: (Npr. Google Analytics ili Firebase) za praćenje stabilnosti aplikacije.",
        "Pravna obveza: Ako to nalaže zakon.",
      ],
    },
    {
      title: "5. Vaša prava (GDPR i slični zakoni)",
      paragraphs: ["U svakom trenutku imate pravo:"],
      list: [
        "Pristupiti svojim podacima koje čuvamo.",
        "Zatražiti ispravak netočnih podataka.",
        'Zatražiti brisanje svih vaših podataka i fotografija iz našeg sustava (opcija "Obriši račun" unutar aplikacije).',
        "Povući privolu za obradu fotografija u bilo kojem trenutku.",
      ],
    },
    {
      title: "6. Kolačići i praćenje",
      paragraphs: [
        "Aplikacija može koristiti identifikatore uređaja za personalizaciju sadržaja i analizu prometa, što nam pomaže da preporuke rutina budu što preciznije.",
      ],
    },
    {
      title: "7. Kontakt",
      paragraphs: [
        "Za sva pitanja u vezi s vašim podacima, možete nas kontaktirati na: info@myskincodeapp.com.",
      ],
    },
  ],
};

export const TERMS_OF_USE: LegalDocument = {
  id: "terms",
  title: "Uvjeti i odredbe korištenja aplikacije",
  updated: "15. Januar 2026.",
  intro:
    "Dobrodošli u MySkin Code. Korištenjem ove aplikacije pristajete na sljedeće uvjete i odredbe. Molimo vas da ih pažljivo pročitate prije početka korištenja.",
  sections: [
    {
      title: "1. Odricanje od medicinske odgovornosti",
      paragraphs: [
        "Sadržaj i funkcionalnosti ove aplikacije, uključujući analizu kože putem kamere/fotografija i preporučene rutine njege, služe isključivo u informativne i edukativne svrhe.",
        "Nije medicinski savjet: Analiza koju pruža aplikacija nije medicinska dijagnoza, liječnički nalaz niti stručno mišljenje dermatologa.",
        "Konzultacije s liječnikom: Preporuke aplikacije ne smiju zamijeniti profesionalni medicinski savjet. Uvijek se obratite kvalificiranom dermatologu ili liječniku prije uvođenja novih preparata, posebno ako imate specifična stanja kože, alergije ili koristite propisanu terapiju.",
        "Hitni slučajevi: Ako sumnjate na ozbiljne zdravstvene probleme (npr. promjene na mladežima koje krvare ili brzo rastu), odmah potražite stručnu pomoć.",
      ],
    },
    {
      title: "2. Korištenje aplikacije i rezultati",
      list: [
        "Aplikacija koristi algoritme za analizu vizualnih podataka koje dostavlja korisnik. Preciznost analize ovisi o kvaliteti fotografije, osvjetljenju i drugim faktorima.",
        "Korisnik prihvaća da rezultati analize mogu varirati i da aplikacija ne jamči specifične estetske ili zdravstvene rezultate.",
        "Korištenje preporučenih proizvoda i rutina radite na vlastitu odgovornost.",
      ],
    },
    {
      title: "3. Privatnost i podaci",
      paragraphs: [
        "Vaša privatnost nam je prioritet. S obzirom na to da aplikacija analizira fotografije vašeg lica:",
      ],
      list: [
        "Svi podaci obrađuju se u skladu s našom Politikom privatnosti.",
        "Korisnik daje suglasnost aplikaciji za pristup kameri i pohrani fotografija isključivo u svrhu analize i praćenja napretka kože.",
      ],
    },
    {
      title: "4. Ograničenje odgovornosti",
      paragraphs: [
        "MySkin Code, njezini vlasnici i programeri neće biti odgovorni za bilo kakvu štetu, iritacije kože, alergijske reakcije ili druge neželjene efekte nastale upotrebom preporučenih rutina ili proizvoda. Korisnik je dužan provjeriti sastav svakog proizvoda prije nanošenja.",
      ],
    },
    {
      title: "5. Dobna granica",
      paragraphs: [
        "Korištenje aplikacije dopušteno je osobama starijim od 18 godina (ili uz suglasnost roditelja/skrbnika, ovisno o lokalnim zakonima).",
      ],
    },
    {
      title: "6. Izmjene uvjeta",
      paragraphs: [
        "Zadržavamo pravo izmjene ovih Uvjeta u bilo kojem trenutku. Nastavak korištenja aplikacije nakon promjena podrazumijeva vaše prihvaćanje novih uvjeta.",
      ],
    },
  ],
};
