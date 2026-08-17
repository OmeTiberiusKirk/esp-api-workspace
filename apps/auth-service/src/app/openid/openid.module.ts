import { Module } from '@nestjs/common';
import { ThirdPartyLoginModule } from '../third-party-login/third-party-login.module';
import { OpenidController } from './openid.controller';
import { OpenidService } from './openid.service';

@Module({
  imports: [ThirdPartyLoginModule],
  controllers: [OpenidController],
  providers: [OpenidService],
})
export class OpenidModule {}
