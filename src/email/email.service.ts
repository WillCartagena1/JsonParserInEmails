import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as mailparser from 'mailparser';

@Injectable()
export class EmailService {
  async processEmail(url: string) {
    try {
      const rawData = await this.readFileAsync(url);
      const mailData = await mailparser.simpleParser(rawData);

      const json = this.extractJsonFromMailData(mailData);

      if (json) {
        return json;
      }
    } catch (error) {
      throw new NotFoundException('Error al procesar el correo electrónico');
    }

    throw new NotFoundException('JSON no encontrado en el correo electrónico');
  }

  private async readFileAsync(url: string): Promise<Buffer> {
    try {
      return await fs.promises.readFile(url);
    } catch (error) {
      throw new NotFoundException('No se pudo leer el archivo de correo electrónico');
    }
  }

  private extractJsonFromMailData(mailData: mailparser.ParsedMail): any {
    if (mailData && mailData.text) {
      try {
        return JSON.parse(mailData.text);
      } catch (error) {
        throw new NotFoundException('El cuerpo del correo no contiene un JSON válido');
      }
    }

    return null;
  }
}
