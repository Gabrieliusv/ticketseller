import { Publisher, Subjects, OrderCancelledEvent } from '@gsstickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
