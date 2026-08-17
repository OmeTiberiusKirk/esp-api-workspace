const BANGKOK_OFFSET_MINUTES = 7 * 60;

interface ParsedDate {
  year: number;
  month: number;
  day: number;
}

/* frontend ส่งวันที่มาได้ 2 รูปแบบ: DD/MM/YYYY แบบ พ.ศ. (เช่น 17/08/2569) หรือ YYYY-MM-DD
   ปีที่ >= 2400 ถือว่าเป็น พ.ศ. เสมอ ต้องลบ 543 ก่อนแปลงเป็น Date จริง */
const parseThaiDate = (value: string): ParsedDate | null => {
  const ddmmyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]);
    let year = Number(ddmmyyyy[3]);
    if (year >= 2400) year -= 543;
    return { year, month, day };
  }

  const isoDate = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoDate) {
    let year = Number(isoDate[1]);
    if (year >= 2400) year -= 543;
    return { year, month: Number(isoDate[2]), day: Number(isoDate[3]) };
  }

  return null;
};

/* วันที่ผู้ใช้กรอกหมายถึง "เที่ยงคืนตามเวลาไทย" — ต้องแปลงกลับเป็น UTC (ลบ 7 ชม.) ก่อนเทียบกับ
   คอลัมน์ timestamptz ใน DB ไม่งั้นข้อมูลของวันนั้นจะตกหล่นช่วงเช้าตรู่/ดึกๆ ตามเขตเวลา */
const bangkokBoundaryToUtc = (date: ParsedDate, endOfDay: boolean): Date => {
  const ms = endOfDay
    ? Date.UTC(date.year, date.month - 1, date.day, 23, 59, 59, 999)
    : Date.UTC(date.year, date.month - 1, date.day, 0, 0, 0, 0);
  return new Date(ms - BANGKOK_OFFSET_MINUTES * 60_000);
};

export const parseDateRangeFilter = (
  startDate?: string,
  endDate?: string,
): { gte?: Date; lte?: Date } | undefined => {
  const start = startDate ? parseThaiDate(startDate) : null;
  const end = endDate ? parseThaiDate(endDate) : null;
  if (!start && !end) return undefined;

  return {
    ...(start ? { gte: bangkokBoundaryToUtc(start, false) } : {}),
    ...(end ? { lte: bangkokBoundaryToUtc(end, true) } : {}),
  };
};
