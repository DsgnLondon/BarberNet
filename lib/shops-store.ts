export interface ShopListing {
  id: string;
  name: string;
  priceGBP: number;
  location: string; // "City, Area"
  city?: string;
  area?: string;
  description: string;
  phone: string;
  photos?: { uri: string }[];
  image?: any;
  chairs?: number;
  ownerId?: string;
  ownerEmail?: string;
}

let shops: ShopListing[] = [
  {
    id: '1',
    name: 'Prime Location Barber Shop',
    city: 'London',
    area: 'Islington',
    priceGBP: 85000,
    chairs: 4,
    description: 'Well-established barber shop in prime Islington location. Fully operational with strong foot traffic and loyal clientele.',
    image: require('../assets/images/brandlogo.png'),
    phone: '+44 7000 000000',
    location: 'London, Islington',
  },
  {
    id: '2',
    name: 'Traditional Barber Shop',
    city: 'Manchester',
    area: 'Oldham',
    priceGBP: 45000,
    chairs: 3,
    description: 'Traditional barbering studio with loyal customer base. Perfect for an owner-operator looking to grow.',
    image: require('../assets/images/brandlogo.png'),
    phone: '+44 7000 000001',
    location: 'Manchester, Oldham',
  },
];

const subs = new Set<() => void>();
function emit() { subs.forEach(fn => fn()); }

export const shopsStore = {
  get(): ShopListing[] { return shops; },
  subscribe(cb: () => void) { subs.add(cb); return () => { subs.delete(cb); }; },
  add(item: ShopListing) { shops = [item, ...shops]; emit(); },
  update(id: string, patch: Partial<ShopListing>) {
    shops = shops.map(s => s.id === id ? { ...s, ...patch } : s); emit();
  },
  remove(id: string) { shops = shops.filter(s => s.id !== id); emit(); },
};
