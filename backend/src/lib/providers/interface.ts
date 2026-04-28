export interface VMConfig {
  name: string;
  region: string;
  plan: string;
  image: string;
  userData?: string;
  sshKeys?: string[];
}

export interface VM {
  id: string;
  providerId: string;
  name: string;
  ip: string | null;
  status: string;
  region: string;
  plan: string;
  createdAt: Date;
}

export interface Snapshot {
  id: string;
  name: string;
  sizeGb: number;
  status: string;
  createdAt: Date;
}

export interface VMStats {
  cpu: number;
  memory: number;
  disk: number;
  bandwidth: number;
}

export interface Region {
  id: string;
  name: string;
  available: boolean;
}

export interface Plan {
  id: string;
  name: string;
  memory: number;
  vcpus: number;
  disk: number;
  transfer: number;
  priceMonthly: number;
}

export interface CloudProvider {
  getAccountInfo(): Promise<{
    email: string;
    credits: number;
    creditExpiry: Date | null;
    balance: number;
    status: string;
    vmLimit: number;
    vmCount: number;
  }>;

  getCredits(): Promise<{
    amount: number;
    expiryDate: Date | null;
    daysRemaining: number | null;
    percentUsed: number;
  }>;

  createVM(config: VMConfig): Promise<VM>;
  deleteVM(vmId: string): Promise<void>;
  startVM(vmId: string): Promise<void>;
  stopVM(vmId: string): Promise<void>;
  restartVM(vmId: string): Promise<void>;
  listVMs(): Promise<VM[]>;
  getVM(vmId: string): Promise<VM>;

  createSnapshot(vmId: string, name: string): Promise<Snapshot>;
  restoreSnapshot(snapshotId: string, targetVmId?: string): Promise<VM>;
  listSnapshots(): Promise<Snapshot[]>;
  deleteSnapshot(snapshotId: string): Promise<void>;
  
  getVMStats(vmId: string): Promise<VMStats>;
  getConsoleUrl(vmId: string): Promise<string>;
  
  getPlans(): Promise<Plan[]>;
  getRegions(): Promise<Region[]>;
}
