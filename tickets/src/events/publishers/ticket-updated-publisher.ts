import { Publisher, Subjects, TicketUpdatedEvent } from '@gsstickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
