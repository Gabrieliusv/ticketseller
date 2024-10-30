import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { getId, getSigninCookie } from '../../test/helper';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('marks an order as canceled', async () => {
  const ticket = Ticket.build({
    id: getId(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const userCookie = getSigninCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', userCookie)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Canceled);
});

it('emits an order cancelled event', async () => {
  const ticket = Ticket.build({
    id: getId(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const userCookie = getSigninCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', userCookie)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
