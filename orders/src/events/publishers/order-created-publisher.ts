import { Publisher, OrderCreatedEvent, Subjects } from '@gsstickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
