import * as Joi from 'joi';

export const regServiceEnvSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3002),
  DATABASE_URL: Joi.string().uri().required(),

  MAILER_SERVICE_HOST: Joi.string().default('localhost'),
  MAILER_SERVICE_PORT: Joi.number().port().default(3004),
});
