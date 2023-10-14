import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as mailparser from 'mailparser';
import axios from 'axios';


@Injectable()
export class EmailService {
  async processEmail(url: string) {
    try {
      const rawData = await this.readFileAsync(url);
      const attachments = await this.extractAttachments(rawData);
      for (const attachment of attachments) {
        if (attachment.filename.endsWith('.json')) {
          return JSON.parse(attachment.content.toString());
        }
      }
      const googleDriveUrl = this.extractGoogleDriveUrl(rawData.toString());
      if (googleDriveUrl) {
        const json = await this.downloadJsonFromUrl(googleDriveUrl);
        return json;
      }
      else {
        const extractedUrl = this.extractUrlFromMail(rawData.toString());
        if (extractedUrl) {
          const json = await this.downloadJsonFromUrl(extractedUrl);
          return json;
        }
      }

    } catch (error) {
      throw new NotFoundException('Error processing email');
    }

    throw new NotFoundException('JSON not found in email');
  }

  private async readFileAsync(url: string): Promise<Buffer> {
    try {
      return await fs.promises.readFile(url);
    } catch (error) {
      throw new NotFoundException(
        'Cannot read email file',
      );
    }
  }

  private extractUrlFromMail(mailContent: string): string | null {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const matches = mailContent.match(urlRegex);
    return matches ? matches[0] : null;
  }

  private extractGoogleDriveUrl(mailContent: string): string | null {
    const regex = /https:\/\/drive\.google\.com\/[^\s/]+\/d\/([^/?#]+)/;
    const match = mailContent.match(regex);
    if (match && match[1]) {
      const fileId = match[1];
      return 'https://drive.google.com/uc?id='+fileId;
    }

    return match ? match[0] : null;
  }

  private async downloadJsonFromUrl(url: string): Promise<any> {
    try {
      const response = await axios.get(url);
      console.log(response.data);
      
      return response.data;
    } catch (error) {
      throw new NotFoundException(
        'Could not download JSON from Google Drive URL',
      );
    }
  }

  private async extractAttachments(rawData: Buffer): Promise<any[]> {
    const mailData = await mailparser.simpleParser(rawData);

    if (mailData.attachments) {
      return mailData.attachments;
    }

    return [];
  }
}
