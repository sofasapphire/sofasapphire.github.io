/** Общие данные сайта: имя, контакты, меню. Меняются здесь — подхватываются везде. */

export const site = {
  name: 'Софа',
  brand: 'Sofa Sapphire',
  role: 'фотограф',
  city: 'Брест',
  region: 'Брест и область',
  description:
    'Фотограф Софа, Брест: репортаж мероприятий и праздников, свадьбы, love story, семейные съёмки, беременность, портреты.',
} as const;

export const contacts = {
  telegram: { url: 'https://t.me/sofi_sapphire', handle: '@sofi_sapphire' },
  instagram: { url: 'https://instagram.com/sofa.sapphire', handle: '@sofa.sapphire' },
  phone: { href: 'tel:+375333511686', label: '+375 33 351-16-86' },
} as const;

export interface NavItem {
  href: string;
  label: string;
}

export const nav: NavItem[] = [
  { href: '/portfolio/', label: 'Портфолио' },
  { href: '/ceny/', label: 'Цены' },
  { href: '/sertifikat/', label: 'Сертификат' },
  { href: '/obo-mne/', label: 'Обо мне' },
  { href: '/kontakty/', label: 'Контакты' },
];
