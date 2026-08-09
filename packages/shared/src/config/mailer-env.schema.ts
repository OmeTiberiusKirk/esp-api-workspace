import * as Joi from 'joi';

export const mailerEnvSchema = Joi.object({
  EMAIL_PROVIDER: Joi.string().valid('self', 'local').default('local'),
  EMAIL_SENDER: Joi.string().email().required(),
  EMAIL_HOST: Joi.string().default('localhost'),
  EMAIL_PORT: Joi.number().port().default(1025),
  EMAIL_USER: Joi.string().when('EMAIL_PROVIDER', {
    is: 'self',
    then: Joi.required(),
  }),
  EMAIL_PASS: Joi.string().when('EMAIL_PROVIDER', {
    is: 'self',
    then: Joi.required(),
  }),
});
