import { Client } from 'ldapts';

export type LdapAuthFailureReason =
  | 'not_configured'
  | 'connection_error'
  | 'invalid_credentials';

export interface LdapAuthResult {
  ok: boolean;
  reason?: LdapAuthFailureReason;
}

/* AD ปฏิเสธด้วยเหตุผลไม่ตรงกันในแต่ละ error — จัดกลุ่มเป็นแค่ 2 อย่างที่ผู้เรียกสนใจจริง:
   ต่อ host ไม่ติดเลย (ลอง host ถัดไปได้ทันที) กับ credential ผิด (ลอง template ถัดไปในตัว host เดิม) */
const isConnectionError = (err: unknown): boolean => {
  const code = (err as { code?: string })?.code;
  if (code && ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH'].includes(code)) {
    return true;
  }
  const name = (err as { name?: string })?.name;
  return name === 'ConnectionError';
};

const bindOnce = async (
  url: string,
  bindDn: string,
  password: string,
): Promise<LdapAuthResult> => {
  const client = new Client({
    url,
    tlsOptions: {
      rejectUnauthorized:
        (process.env.LDAP_TLS_REJECT_UNAUTHORIZED ?? 'true') !== 'false',
    },
    connectTimeout: Number(process.env.LDAP_CONNECT_TIMEOUT_MS ?? 5_000),
  });

  try {
    await client.bind(bindDn, password);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: isConnectionError(err) ? 'connection_error' : 'invalid_credentials',
    };
  } finally {
    try {
      await client.unbind();
    } catch {
      /* ignore unbind failure — connection may already be dead */
    }
  }
};

const renderBindDn = (template: string, username: string): string =>
  template.replace(/\{\{username\}\}/g, username);

/* พยายามทีละ host (LDAP_URLS) และทีละ template (LDAP_BIND_DN_TEMPLATES) ภายใน host นั้น
   ถ้า host ต่อไม่ติดเลย ข้าม template ที่เหลือของ host นั้นไปเลย ไม่มีประโยชน์ที่จะลองซ้ำ */
export const authenticateAgainstAd = async (
  username: string,
  password: string,
): Promise<LdapAuthResult> => {
  const urls = (process.env.LDAP_URLS ?? '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  const templates = (process.env.LDAP_BIND_DN_TEMPLATES ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  if (!urls.length || !templates.length) {
    return { ok: false, reason: 'not_configured' };
  }

  let lastReason: LdapAuthFailureReason = 'invalid_credentials';

  for (const url of urls) {
    for (const template of templates) {
      const bindDn = renderBindDn(template, username);
      const result = await bindOnce(url, bindDn, password);

      if (result.ok) return result;

      lastReason = result.reason ?? lastReason;
      if (result.reason === 'connection_error') break;
    }
  }

  return { ok: false, reason: lastReason };
};
