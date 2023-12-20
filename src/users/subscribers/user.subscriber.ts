import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    connection: Connection,
    private readonly usersService: UsersService,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    event.entity.password = await this.usersService.hashPassword(
      event.entity.password,
    );
  }

  async beforeUpdate(event: UpdateEvent<User>) {
    if (event.entity.password !== event.databaseEntity.password) {
      event.entity.password = await this.usersService.hashPassword(
        event.entity.password,
      );
    }
  }
}
