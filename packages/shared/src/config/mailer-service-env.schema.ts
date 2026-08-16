import * as Joi from 'joi';

export const mailerServiceEnvSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3003),

  MAILER_PROVIDER: Joi.string().valid('self', 'local').default('local'),
  MAILER_SENDER: Joi.string().email().required(),
  MAILER_HOST: Joi.string().default('localhost'),
  MAILER_PORT: Joi.number().port().default(1025),
  MAILER_USER: Joi.string().when('MAILER_PROVIDER', {
    is: 'self',
    then: Joi.required(),
  }),
  MAILER_PASS: Joi.string().when('MAILER_PROVIDER', {
    is: 'self',
    then: Joi.required(),
  }),
});
