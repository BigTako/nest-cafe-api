import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomsService } from '../../customs/customs.service';

// add new property to existing interface

@Injectable()
export class PopulateOrderMiddleware implements NestMiddleware {
  constructor(private customsService: CustomsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.body.customs && req.body.customs.length) {
      const customsPopulated = await Promise.all(
        req.body.customs.map(async (id: number) => {
          return this.customsService.findOne(id).catch((err) => {
            throw new NotFoundException(`Custom with id ${id} not found`);
          });
        }),
      );

      req.body.customs = customsPopulated;
      req.body.totalPrice = customsPopulated.reduce(
        (acc, item) => acc + item.price,
        0,
      );
    }
    next();
  }
}
