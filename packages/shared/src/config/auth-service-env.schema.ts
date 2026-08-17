import * as Joi from 'joi';

export const authServiceEnvSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3002),
  MAILER_SERVICE_HOST: Joi.string().default('localhost'),
  MAILER_SERVICE_PORT: Joi.number().port().default(3004),
  MASTER_SERVICE_HOST: Joi.string().default('localhost'),
  MASTER_SERVICE_PORT: Joi.number().port().default(3001),
  DATABASE_URL: Joi.string().uri(),

  THAID_CLIENT_ID: Joi.string().trim().min(5),
  THAID_CLIENT_SECRET: Joi.string().trim().min(5),
  THAID_TOKEN_URL: Joi.string().uri(),
  THAID_REDIRECT_URI: Joi.string().uri(),

  OPENID_CLIENT_ID: Joi.string().trim().allow(''),
  OPENID_CLIENT_SECRET: Joi.string().trim().allow(''),
  OPENID_TOKEN_URL: Joi.string().uri().allow(''),
  OPENID_USERINFO_URL: Joi.string().uri().allow(''),
  OPENID_REDIRECT_URI: Joi.string().uri().allow(''),

  DBDID_CLIENT_ID: Joi.string().trim().allow(''),
  DBDID_CLIENT_SECRET: Joi.string().trim().allow(''),
  DBDID_TOKEN_URL: Joi.string().uri().allow(''),
  DBDID_USERINFO_URL: Joi.string().uri().allow(''),
  DBDID_REDIRECT_URI: Joi.string().uri().allow(''),

  LDAP_URLS: Joi.string().allow(''),
  LDAP_BIND_DN_TEMPLATES: Joi.string().allow(''),
  LDAP_TLS_REJECT_UNAUTHORIZED: Joi.boolean().default(true),
  LDAP_CONNECT_TIMEOUT_MS: Joi.number().default(5_000),
  LDAP_BIND_TIMEOUT_MS: Joi.number().default(5_000),

  LOCAL_STORAGE_PATH: Joi.string().allow(''),

  OTP_HMAC_SECRET: Joi.string().trim().min(5),
  PASSWORD_HMAC_SECRET: Joi.string().trim().min(5),
  JWT_ACCESS_SECRET: Joi.string().trim().min(5),
  JWT_REFRESH_SECRET: Joi.string().trim().min(5),
  JWT_ACCESS_EXPIRES_IN_SEC: Joi.number().default(900),
  JWT_REFRESH_EXPIRES_IN_SEC: Joi.number().default(604_800),
});
