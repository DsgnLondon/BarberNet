export type Region = 'London' | 'Manchester' | 'Birmingham' | 'Edinburgh';

export interface BarberProfile {
  id: string;
  name: string;
  city: Region;
  area: string;
  years: number;
  skills: string[];
  bio?: string;
  contact?: { email?: string; phone?: string; viaEmail: boolean; viaPhone: boolean };
  available: boolean;
  avatar: any; // require() or { uri }
  createdAt: number;
  ownerId?: string;
  ownerEmail?: string;
}

const defaultAvatar = require('../assets/images/brandlogo.png');

let barbers: BarberProfile[] = [
  { id: 'b1', name: 'Marcus Johnson', city: 'London', area: 'Camden', years: 8, skills: ['Classic Cuts', 'Beard Styling', 'Fade Cuts'], avatar: defaultAvatar, available: true, createdAt: Date.now() - 300000 },
  { id: 'b2', name: 'Sofia Chen', city: 'Manchester', area: 'Northern Quarter', years: 5, skills: ['Creative Cuts', 'Color Work', 'Undercuts'], avatar: defaultAvatar, available: true, createdAt: Date.now() - 200000 },
  { id: 'b3', name: 'James Thompson', city: 'Birmingham', area: 'Jewellery Quarter', years: 12, skills: ['Traditional Cuts', 'Straight Razor', 'Mustache Grooming'], avatar: defaultAvatar, available: false, createdAt: Date.now() - 100000 },
];

const subs = new Set<() => void>();

function emit() { subs.forEach((fn) => fn()); }

export const barbersStore = {
  get(): BarberProfile[] { return barbers; },
  subscribe(cb: () => void) { subs.add(cb); return () => { subs.delete(cb); }; },
  add(input: {
    name: string; city: Region; area?: string; years?: number; skills: string[]; bio?: string;
    contactBy: { email: boolean; phone: boolean }; email?: string; phone?: string; available: boolean; photo?: any;
  }) {
    const profile: BarberProfile = {
      id: `b${Date.now()}`,
      name: input.name.trim(),
      city: input.city,
      area: input.area?.trim() || '',
      years: Number(input.years) || 0,
      skills: input.skills,
      bio: input.bio?.trim() || undefined,
      contact: { email: input.email, phone: input.phone, viaEmail: input.contactBy.email, viaPhone: input.contactBy.phone },
      available: input.available,
      avatar: input.photo || defaultAvatar,
      createdAt: Date.now(),
    };
    barbers = [profile, ...barbers];
    emit();
    return profile;
  },
  update(id: string, patch: Partial<BarberProfile>) {
    barbers = barbers.map(b => b.id === id ? { ...b, ...patch } : b); emit();
  },
  remove(id: string) { barbers = barbers.filter(b => b.id !== id); emit(); },
};
