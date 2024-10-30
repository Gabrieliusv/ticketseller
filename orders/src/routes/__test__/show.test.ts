import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { getId, getSigninCookie } from '../../test/helper';
import { app } from '../../app';

it('fetches the order', async () => {
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

  const { body: fetchOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userCookie)
    .send()
    .expect(200);

  expect(fetchOrder.id).toEqual(order.id);
});

it('returns an error if one user ties to fetch anothers users order', async () => {
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
    .get(`/api/orders/${order.id}`)
    .set('Cookie', getSigninCookie())
    .send()
    .expect(401);
});
