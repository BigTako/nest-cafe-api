import {
  Equal,
  FindManyOptions,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

function transformQuery(query: Object) {
  const newQuery = {};

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      newQuery[key] = Equal(value);
    } else {
      let operator = Object.keys(query[key])[0];
      let value = Number(query[key][operator]);
      switch (operator) {
        case 'eq':
          newQuery[key] = Equal(value);
          break;
        case 'gt':
          newQuery[key] = MoreThan(value);
          break;
        case 'gte':
          newQuery[key] = MoreThanOrEqual(value);
          break;
        case 'lt':
          newQuery[key] = LessThan(value);
          break;
        case 'lte':
          newQuery[key] = LessThanOrEqual(value);
          break;
        default:
          throw new Error('Invalid operator');
      }
    }
  }
  return newQuery;
}

export class ApiFeatures {
  private newQuery: FindManyOptions = {};

  constructor(public query) {}

  filter() {
    const queryObj = { ...this.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    this.newQuery.where = transformQuery(queryObj);
    return this;
  }

  limitFields() {
    if (this.query.fields) {
      const fields = this.query.fields.split(',');
      this.newQuery.select = Object.fromEntries(
        fields.map((field: string) => [field, true]),
      );
      // const fields = this.query.fields.split(',').join(' ');
      // this.newQuery.select = fields;
    }
    return this;
  }

  sort() {
    if (this.query.sort) {
      const sortByFields = this.query.sort.split(',');
      this.newQuery.order = Object.fromEntries(
        sortByFields.map((field: string) => {
          if (field.startsWith('-')) {
            return [field.slice(1), 'DESC'];
          }
          return [field, 'ASC'];
        }),
      );
    }
    return this;
  }

  paginate() {
    if (this.query.page || this.query.limit) {
      const page = Number(this.query.page) || 1;
      const limit = Number(this.query.limit) || 10;
      const skip = (page - 1) * limit;
      this.newQuery.skip = skip;
      this.newQuery.take = limit;
    }
    return this;
  }

  getQuery() {
    return this.newQuery;
  }
}
