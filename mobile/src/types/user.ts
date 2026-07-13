export interface UserData {
  id: number;
  card_id?: number;
  card_member_id?: number;
  fullName: string;
  userId: string;
  user_code?: string;
  phoneNumber: string;
  countryCode?: string;
  homeAddress: string;
  assignedShelter: string;
  shelterRoom: string;
  familyMembers: number;
  status: 'inside-shelter' | 'outside-shelter';
  hasChildren?: boolean;
  childrenCount?: number;
  hasPets?: boolean;
  nearestShelter?: {
    name: string;
    distance: string;
    capacity: number;
    currentOccupancy: number;
    status: 'open' | 'full' | 'closed';
    lat?: number;
    lng?: number;
  };
  family_code?: string;
};
