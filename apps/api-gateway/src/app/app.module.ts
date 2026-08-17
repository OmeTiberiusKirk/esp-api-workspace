import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { apiGatewayEnvSchema } from '@esp/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MasterModule } from './master/master.module';
import { MailModule } from './mailer/mailer.module';
import { RegistrationModule } from './registration/registration.module';
import { AuthModule } from './auth/auth.module';
import { ManageUserModule } from './manage-user/manage-user.module';
import { MeModule } from './me/me.module';
import { RegisterDataModule } from './register-data/register-data.module';
import { RegisterExternalModule } from './register-external/register-external.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: apiGatewayEnvSchema,
    }),
    MasterModule,
    RegistrationModule,
    MailModule,
    AuthModule,
    ManageUserModule,
    MeModule,
    RegisterDataModule,
    RegisterExternalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
