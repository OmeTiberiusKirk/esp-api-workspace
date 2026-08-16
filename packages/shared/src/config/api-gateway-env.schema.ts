import * as Joi from 'joi';

export const apiGatewayEnvSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  MASTER_SERVICE_HOST: Joi.string().default('localhost'),
  MASTER_SERVICE_PORT: Joi.number().port().default(3002),
  REG_SERVICE_HOST: Joi.string().default('localhost'),
  REG_SERVICE_PORT: Joi.number().port().default(3003),
  MAILER_SERVICE_HOST: Joi.string().default('localhost'),
  MAILER_SERVICE_PORT: Joi.number().port().default(3004),
  CORS_ORIGIN: Joi.string().default('https://esp-uat.dol.go.th'),
});
