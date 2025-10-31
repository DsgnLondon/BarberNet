export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  photo?: any;
}

let user: UserProfile = {
  name: 'User via Google',
  phone: '+44 7911 123456',
  email: 'user@google.com',
  photo: require('../assets/images/brandlogo.png'),
};

const subs = new Set<() => void>();
function emit() { subs.forEach((fn) => fn()); }

export const userStore = {
  get(): UserProfile { return user; },
  subscribe(cb: () => void) { subs.add(cb); return () => { subs.delete(cb); }; },
  update(patch: Partial<UserProfile>) { user = { ...user, ...patch }; emit(); },
};
