import { BadRequestException } from '@nestjs/common';

export function catchAsync(fn: Function): Promise<any> {
  try {
    return fn();
  } catch (err) {
    if (err.detail) {
      throw new BadRequestException(err.detail);
    }
    throw new BadRequestException(err.message);
  }
}
