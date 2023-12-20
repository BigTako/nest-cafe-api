import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  // private transporter: nodemailer.Transporter;
  // constructor(private configService: ConfigService) {
  //   this.transporter = nodemailer.createTransport({
  //     service: configService.get('EMAIL_SERVICE'),
  //     auth: {
  //       user: configService.get('EMAIL_USERNAME'),
  //       pass: configService.get('EMAIL_PASSWORD'),
  //     },
  //   });
  // }
}
