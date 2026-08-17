import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { regServiceEnvSchema } from '@esp/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegModule } from './reg/reg.module';
import { ThaiGovAuthModule } from './thai-gov-auth/thai-gov-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: regServiceEnvSchema,
    }),
    RegModule,
    ThaiGovAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
