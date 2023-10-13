import { Controller, Get, Param, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get(':url')
  async getEmail(@Param('url') url: string) {
    try {
      const json = await this.emailService.processEmail(url);
      return json;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error al procesar el correo electrónico');
      }
    }
  }
}
