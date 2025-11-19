// Profile related types for Parent app

export interface ParentProfile {
  id: string;
  role: "parent";
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  language: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Parent-specific fields
  occupation?: string;
  relationship_to_student?: string;
  emergency_contact?: string;
  address?: string;
  notes?: string;
  last_login_at?: string;
  push_token?: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  occupation?: string;
  relationship_to_student?: string;
  emergency_contact?: string;
  address?: string;
  language?: string;
  timezone?: string;
}

export interface UploadAvatarResult {
  url: string;
  path: string;
}

export interface ChangePasswordData {
  newPassword: string;
}
