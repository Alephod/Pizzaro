export interface ProfileData {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  dob: string | null;
  addresses: string[];
};