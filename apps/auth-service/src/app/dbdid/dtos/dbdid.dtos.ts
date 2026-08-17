export interface DbdidTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface DbdidProfile {
  juristic_id: string;
  juristic_name?: string;
  email?: string;
  phone_number?: string;
}

export interface DbdidLoginResult {
  isExistingUser: boolean;
  profile: DbdidProfile;
  user?: {
    user_id: string;
    legal_id: string | null;
    legal_name: string | null;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
  };
  access_token?: string;
  refresh_token?: string;
  login_channel?: string;
  login_channel_label?: string;
}
