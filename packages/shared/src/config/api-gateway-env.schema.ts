import * as Joi from 'joi';

export const apiGatewayEnvSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  MASTER_SERVICE_HOST: Joi.string().default('localhost'),
  MASTER_SERVICE_PORT: Joi.number().port().default(3001),
  AUTH_SERVICE_HOST: Joi.string().default('localhost'),
  AUTH_SERVICE_PORT: Joi.number().port().default(3002),
});
