import { CreatePersonalDto, CreateAddressDto } from './create-user.dto';

/* ชื่อ field ยังเป็นชุด department_* ตามสัญญาเดิมที่ frontend ส่งมา ส่วนปลายทางที่เก็บจริงคือ
   reg.tb_user_private_office ซึ่งใช้ชื่อ private_office_* — service เป็นคนแมปให้
   department_type เก็บลง private_office_id: '1'=สำนักงานช่างรังวัดเอกชน, '2'=หน่วยงานภายนอกอื่น ๆ */
export class CreateDepartmentAddressDto {
  department_type!: string;
  private_office_certificate_no?: string;
  department_adress_no?: string;
  department_moo?: string;
  department_alley?: string;
  department_soi?: string;
  department_road?: string;
  department_tambon_seq?: string;
  department_amphoe_seq?: string;
  department_province_seq?: string;
  department_postcode?: string;
  department_telephone?: string;
  department_fax?: string;
}

/* ไฟล์แนบส่งมาจาก gateway เป็น base64 ผ่าน TCP (ไม่ใช้ multipart ข้าม microservice โดยตรง)
   gateway เป็นคนรับ multipart จริงแล้ว encode ส่งมาที่นี่ ดู register-external.controller.ts ฝั่ง gateway */
export class ExternalOrgAttachmentDto {
  file_name!: string;
  file_mime_type!: string;
  buffer_base64!: string;
}

export class CreateExternalOrgUserDto {
  personal!: CreatePersonalDto;
  address!: CreateAddressDto;
  departmentAddress!: CreateDepartmentAddressDto;
  attachments?: ExternalOrgAttachmentDto[];
}
