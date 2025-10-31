export type JobType = 'full time' | 'part time' | 'rent a chair' | 'temporary' | 'contract';

export interface JobListing {
  id: string;
  company?: string; // optional for compatibility with cards
  title?: string;   // optional for compatibility
  shopName?: string; // from post job modal
  location: string; // City, Area
  city?: string;    // optional for filter by region (derived if needed)
  area?: string;    // optional
  type: JobType;
  salaryText: string;
  description: string;
  phone: string;
  images?: { uri: string }[];
  image?: any; // for mock/static card image
  ownerId?: string;
  ownerEmail?: string;
}

let jobs: JobListing[] = [
  {
    id: '1',
    company: "The Gentleman's Cut",
    title: 'Barber',
    city: 'London',
    area: 'Shoreditch',
    salaryText: '£15-20/hour',
    type: 'full time',
    location: 'London, Shoreditch',
    image: require('../assets/images/brandlogo.png'),
    description: 'Experienced barber needed',
    phone: '+44 7000 000000',
  },
  {
    id: '2',
    company: 'Manchester Barber Co.',
    title: 'Senior Barber',
    city: 'Manchester',
    area: 'City Centre',
    salaryText: '£250/week + tips',
    type: 'rent a chair',
    location: 'Manchester, City Centre',
    image: require('../assets/images/brandlogo.png'),
    description: 'Chair rent available',
    phone: '+44 7000 000000',
  },
];

const subs = new Set<() => void>();
function emit() { subs.forEach((fn) => fn()); }

export const jobsStore = {
  get(): JobListing[] { return jobs; },
  subscribe(cb: () => void) { subs.add(cb); return () => { subs.delete(cb); }; },
  add(job: JobListing) { jobs = [job, ...jobs]; emit(); },
  update(id: string, patch: Partial<JobListing>) {
    jobs = jobs.map(j => j.id === id ? { ...j, ...patch } : j); emit();
  },
  remove(id: string) { jobs = jobs.filter(j => j.id !== id); emit(); },
};
