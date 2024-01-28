import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FindManyOptions, Repository } from 'typeorm';

interface ClassConstructor {
  new (...args: any[]): {}; // means class
}

interface Entity {
  id: number;
}

export class ServiceFactory<T extends Entity> {
  constructor(
    private repository: Repository<T>,
    private configService: ConfigService,
    private createDto: ClassConstructor,
    private updateDto: ClassConstructor,
  ) {}

  async find(options: FindManyOptions): Promise<T[]> {
    return await this.repository.find(options);
  }

  async findOne(id: number): Promise<T> {
    const doc = await this.repository.findOne({
      where: { id },
    } as FindManyOptions<T>);

    if (!doc) {
      throw new NotFoundException(
        this.configService.get('errorMessages.DOCUMENT_NOT_FOUND'),
      );
    }
    return doc;
  }

  async create(data: InstanceType<typeof this.createDto>): Promise<T> {
    const doc = this.repository.create(data as unknown as T);
    await this.repository.save(doc);
    return doc;
  }

  async update(id: number, data: Partial<InstanceType<typeof this.updateDto>>) {
    const doc = await this.findOne(id);
    Object.assign(doc, data); // update doc with new attrs
    return this.repository.save(doc); // save updated doc
  }

  async remove(id: number) {
    const doc = await this.findOne(id);
    return this.repository.remove(doc);
  }
}
