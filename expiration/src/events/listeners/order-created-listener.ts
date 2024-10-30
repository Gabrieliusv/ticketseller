import { Listener, OrderCreatedEvent, Subjects } from '@gsstickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { expirationQueaue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(`Waiting ${delay} millisecond to process the order`);

    await expirationQueaue.add(
      {
        orderId: data.id,
      },
      { delay }
    );

    msg.ack();
  }
}
