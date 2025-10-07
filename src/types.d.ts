export interface UserToCreate {
  first_name: string;
  last_name?: string;
  email: string;
  isActive: boolean;
} // toCreateOwnerUser

interface Service {
  id: number;
  branch_id: number;
  name: string;
  default_duration: number;
  prices: { price: number; duration: number }[];
  description: string | null;
  category: string | null;
  age_restriction: string | null;
  recommendations: string | null;
  group: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationWithBranchesServices {
  id: number;
  name: string;
  organizationBranches: {
    id: number;
    name: string;
    phone: string;
    address: string;
    isActive: boolean;
    services: Service;
  }[];
}
