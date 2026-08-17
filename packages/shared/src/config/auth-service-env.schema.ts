import * as Joi from 'joi';

export const authServiceEnvSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3002),
  MAILER_SERVICE_HOST: Joi.string().default('localhost'),
  MAILER_SERVICE_PORT: Joi.number().port().default(3004),
  DATABASE_URL: Joi.string().uri(),
  THAID_CLIENT_ID: Joi.string().trim().min(5),
  THAID_CLIENT_SECRET: Joi.string().trim().min(5),
  THAID_TOKEN_URL: Joi.string().uri(),
  THAID_REDIRECT_URI: Joi.string().uri(),
});
