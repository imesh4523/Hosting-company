export interface PlanMapping {
  id: string;
  category: 'shared' | 'vps' | 'vds' | 'dedicated' | 'mac' | 'windows';
  name: string;
  price: number;
  specs: {
    cpu: number;
    ram: number;
    disk: number;
  };
  doSlug: string; // DigitalOcean Droplet Slug
}

export const PLANS: PlanMapping[] = [
  // Shared Hosting (Mapped to Standard Droplets)
  {
    id: 'shared-starter',
    category: 'shared',
    name: 'SHARED Starter',
    price: 3.80,
    specs: { cpu: 1, ram: 1, disk: 25 },
    doSlug: 's-1vcpu-1gb'
  },
  {
    id: 'shared-basic',
    category: 'shared',
    name: 'SHARED Basic',
    price: 4.80,
    specs: { cpu: 1, ram: 1, disk: 35 },
    doSlug: 's-1vcpu-1gb-intel'
  },

  // VPS Hosting
  {
    id: 'vps-basic',
    category: 'vps',
    name: 'VPS Basic',
    price: 4.80,
    specs: { cpu: 1, ram: 1, disk: 35 },
    doSlug: 's-1vcpu-1gb'
  },
  {
    id: 'vps-business',
    category: 'vps',
    name: 'VPS Business',
    price: 8.50,
    specs: { cpu: 2, ram: 2, disk: 50 },
    doSlug: 's-2vcpu-2gb'
  },

  // Specialized VPS
  {
    id: 'windows-basic',
    category: 'windows',
    name: 'Basic Windows',
    price: 13.99,
    specs: { cpu: 2, ram: 2, disk: 50 },
    doSlug: 's-2vcpu-2gb' // Use custom Windows image
  },
  {
    id: 'macos-basic',
    category: 'mac',
    name: 'MacOS Basic',
    price: 16.50,
    specs: { cpu: 4, ram: 4, disk: 80 },
    doSlug: 's-4vcpu-8gb' // Higher specs for MacOS simulation
  }
];
