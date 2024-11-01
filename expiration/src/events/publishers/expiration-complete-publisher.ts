import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@gsstickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
