import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { apiGatewayEnvSchema } from '@esp/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MasterModule } from './master/master.module';
import { MailModule } from './mailer/mailer.module';
import { AuthModule } from './auth/auth.module';
import { ThaiGovAuthModule } from './thai-gov-auth/thai-gov-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: apiGatewayEnvSchema,
    }),
    MasterModule,
    AuthModule,
    MailModule,
    ThaiGovAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
