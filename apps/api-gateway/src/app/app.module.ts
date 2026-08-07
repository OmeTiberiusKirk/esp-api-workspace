import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { apiGatewayEnvSchema } from '@esp/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MasterModule } from './master/master.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: apiGatewayEnvSchema,
    }),
    UserModule,
    MasterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
