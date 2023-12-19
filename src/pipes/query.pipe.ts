import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ApiFeatures } from '../utils/apiFeatures';

interface Query {
  sort?: string;
  page?: string;
  limit?: string;
  fields?: string;
}

@Injectable()
export class QueryPipe implements PipeTransform {
  transform(value: Query, metadata: ArgumentMetadata) {
    return new ApiFeatures(value)
      .filter()
      .limitFields()
      .sort()
      .paginate()
      .getQuery();
  }
}
