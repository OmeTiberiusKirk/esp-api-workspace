import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { mailerServiceEnvSchema } from '@esp/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerModule } from './mailer/mailer.module';
import mailerConfigs from '../configs/mailer.configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: mailerServiceEnvSchema,
      load: [mailerConfigs],
    }),
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
