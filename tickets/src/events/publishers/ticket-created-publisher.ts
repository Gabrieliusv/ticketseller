import { Publisher, Subjects, TicketCreatedEvent } from '@gsstickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
