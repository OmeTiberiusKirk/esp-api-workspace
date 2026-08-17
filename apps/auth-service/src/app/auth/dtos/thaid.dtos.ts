export interface ThaidTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
}

export interface ThaidProfile {
  pid: string;
  name?: string;
  name_en?: string;
  birthdate?: string;
  address?: string;
  given_name?: string;
  middle_name?: string;
  family_name?: string;
  given_name_en?: string;
  middle_name_en?: string;
  family_name_en?: string;
  gender?: string;
  smartcard_code?: string;
  title?: string;
  title_en?: string;
  ial?: string;
  date_of_issuance?: string;
  date_of_expiry?: string;
  house_address?: { formatted?: string; raw?: string };
}

export interface ThaidLoginResult {
  isExistingUser: boolean;
  profile: ThaidProfile;
  user?: {
    user_id: string;
    email: string | null;
    is_email_verified: number | null;
    is_verify: number | null;
    user_status: number | null;
    given_name: string | null;
    family_name: string | null;
  };
  access_token?: string;
  refresh_token?: string;
  login_channel?: string;
  login_channel_label?: string;
}
