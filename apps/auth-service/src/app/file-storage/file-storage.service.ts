import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Injectable } from '@nestjs/common';

export interface StoredFile {
  file_name: string;
  file_path: string;
  file_mime_type: string;
  file_size: number;
}

/* เก็บไฟล์ลง local disk ชั่วคราวระหว่างรอ RustFS (ระบบ object storage ที่จะใช้จริงใน production)
   เก็บแค่ relative path (`${subDir}/${storedName}`) ลง DB เพื่อให้ย้าย backend ทีหลังไม่ต้อง migrate path เดิม */
@Injectable()
export class FileStorageService {
  private readonly basePath =
    process.env.LOCAL_STORAGE_PATH || join(process.cwd(), 'uploads');

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    subDir: string,
  ): Promise<StoredFile> {
    const dir = join(this.basePath, subDir);
    await mkdir(dir, { recursive: true });

    const storedName = `${randomUUID()}${extname(originalName)}`;
    await writeFile(join(dir, storedName), buffer);

    return {
      file_name: originalName,
      file_path: `${subDir}/${storedName}`,
      file_mime_type: mimeType,
      file_size: buffer.length,
    };
  }
}
