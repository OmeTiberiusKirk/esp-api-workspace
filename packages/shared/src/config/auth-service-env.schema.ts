import * as Joi from 'joi';

export const authServiceEnvSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3002),
  DATABASE_URL: Joi.string().uri().required(),
});
