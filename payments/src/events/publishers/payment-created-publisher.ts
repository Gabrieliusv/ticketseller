import { Subjects, Publisher, PaymentCreatedEvent } from '@gsstickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
