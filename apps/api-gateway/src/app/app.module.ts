import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { apiGatewayEnvSchema } from '@esp/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MasterModule } from './master/master.module';
import { MailModule } from './mailer/mailer.module';
import { AuthModule } from './auth/auth.module';
import { ThaiGovAuthModule } from './thai-gov-auth/thai-gov-auth.module';
import { LoginModule } from './login/login.module';
import { DbdidModule } from './dbdid/dbdid.module';
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
    AuthModule,
    MailModule,
    ThaiGovAuthModule,
    LoginModule,
    DbdidModule,
    ManageUserModule,
    MeModule,
    RegisterDataModule,
    RegisterExternalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
