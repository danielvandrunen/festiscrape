export interface Artist {
  name: string;
  day?: string;
  stage?: string;
  time?: string;
}

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
  is_favorite: boolean;
  source: 'festileaks' | 'festivalinfo' | 'eblive' | 'followthebeat' | 'partyflock';
  last_updated: Date;
  created_at?: Date;
  artists: Artist[];
}

export interface ScrapeResult {
  success: boolean;
  data?: Festival;
  error?: string;
} 