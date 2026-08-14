import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { regServiceEnvSchema, mailerEnvSchema } from '@esp/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: regServiceEnvSchema.concat(mailerEnvSchema),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
