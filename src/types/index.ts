export interface Festival {
  id: string;
  name: string;
  date: Date;
  website?: string;
  num_acts?: number;
  locations?: string[];
  capacity?: number;
  status: 'active' | 'archived';
  is_interested: boolean;
  source: 'festileaks' | 'festivalinfo' | 'eblive' | 'followthebeat' | 'partyflock';
  last_updated: Date;
  created_at?: Date;
}

export interface FestivalFilters {
  startDate?: Date;
  endDate?: Date;
  location?: string;
  minCapacity?: number;
  maxCapacity?: number;
  search?: string;
  status?: 'active' | 'archived';
  isInterested?: boolean;
} 