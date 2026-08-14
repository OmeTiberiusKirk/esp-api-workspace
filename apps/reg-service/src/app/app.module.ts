import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { regServiceEnvSchema, mailerEnvSchema } from '@esp/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegModule } from './reg/reg.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: regServiceEnvSchema.concat(mailerEnvSchema),
    }),
    RegModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
