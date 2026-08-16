export class CreatePersonalDto {
  user_type_id!: number;
  person_id!: string;
  title!: string;
  given_name!: string;
  middle_name?: string;
  family_name!: string;
  birth_date?: string;
  date_of_expiry?: string;
  email!: string;
  mobile_no!: string;
}

export class CreateAddressDto {
  address_type?: number;
  home_no?: string;
  soi?: string;
  road?: string;
  moo?: string;
  tambol_name?: string;
  amphur_name?: string;
  province_name?: string;
  tambol_code?: string;
  amphur_code?: string;
  province_code?: string;
}

export class CreateUserDto {
  personal!: CreatePersonalDto;
  address!: CreateAddressDto;
  is_thaid_verified?: boolean;
}
