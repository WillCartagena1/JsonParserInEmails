import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailController } from './email/email.controller';
import { EmailModule } from './email/email.module';

@Module({
  imports: [EmailModule],
})
export class AppModule {}
