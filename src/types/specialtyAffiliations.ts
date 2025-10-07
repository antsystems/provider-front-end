// Specialty Affiliations Types

export interface Specialty {
  id: string;
  specialty_id: string;
  specialty_name: string;
  specialty_code: string;
  description: string;
}

export interface AffiliatedSpecialty {
  specialty_id: string;
  specialty_name: string;
  specialty_code?: string;
  description?: string;
}

export interface SpecialtyAffiliation {
  hospital_id: string;
  hospital_name: string;
  affiliated_specialties: AffiliatedSpecialty[];
  specialty_count: number;
  status: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
}

export interface AvailableSpecialtiesResponse {
  message: string;
  specialties: Specialty[];
  count: number;
}

export interface CreateSpecialtyAffiliationRequest {
  specialty_ids: string[];
}

export interface CreateSpecialtyAffiliationResponse {
  message: string;
  affiliation: SpecialtyAffiliation;
}

export interface GetSpecialtyAffiliationResponse {
  message: string;
  affiliation?: SpecialtyAffiliation;
  hospital_id?: string;
  affiliated_specialties?: AffiliatedSpecialty[];
  specialty_count?: number;
}

export interface AffiliatedSpecialtyNamesResponse {
  message: string;
  specialty_names: string[];
  count: number;
}

export interface AddSpecialtiesRequest {
  specialty_ids: string[];
}

export interface AddSpecialtiesResponse {
  message: string;
  added_count: number;
  total_specialties: number;
  warnings?: {
    already_affiliated: string[];
    message: string;
  };
}

export interface RemoveSpecialtyResponse {
  message: string;
  specialty_id: string;
  remaining_specialties: number;
}

export interface DeleteAffiliationResponse {
  message: string;
  hospital_id: string;
}
