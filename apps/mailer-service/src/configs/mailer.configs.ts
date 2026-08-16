import { registerAs } from '@nestjs/config';

export default registerAs('mailer', () => ({
  host: process.env.MAILER_HOST || 'localhost',
  port: parseInt(process.env.MAILER_PORT || '1025', 10),
  sender: process.env.MAILER_SENDER,
  ...((process.env.MAILER_PROVIDER || 'self') === 'self' && {
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  }),
}));
