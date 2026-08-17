import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { authServiceEnvSchema } from '@esp/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ThaiGovAuthModule } from './thai-gov-auth/thai-gov-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: authServiceEnvSchema,
    }),
    AuthModule,
    ThaiGovAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
