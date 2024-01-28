import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { CryptoService } from '../crypto.service';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    connection: Connection,
    private cryptoService: CryptoService,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    event.entity.password = await this.cryptoService.hashPassword(
      event.entity.password,
    );
    event.entity.passwordConfirm = '';
  }

  async beforeUpdate(event: UpdateEvent<User>) {
    if (event.entity.password !== event.databaseEntity.password) {
      event.entity.password = await this.cryptoService.hashPassword(
        event.entity.password,
      );
    }
  }
}
