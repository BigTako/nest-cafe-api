import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {}

  async newTransporter(): Promise<void> {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get('emailConfig.service'),
      auth: {
        user: this.configService.get('emailConfig.username'),
        pass: this.configService.get('emailConfig.password'),
      },
    });
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.configService.get('emailConfig.username'),
        to: options.to,
        subject: options.subject,
        text: options.text,
      });
    } else {
      throw new BadRequestException(
        this.configService.get('errorMessages.EMAIL_TRANSPORTER_ERROR'),
      );
    }
  }

  getTransporter() {
    return this.transporter;
  }
}
