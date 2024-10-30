import request from 'supertest';
import { getId, getSigninCookie } from '../../test/helper';
import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@gsstickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payments';

jest.mock('../../stripe.ts');

it('Returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', getSigninCookie())
    .send({ token: 'test', orderId: getId() })
    .expect(404);
});

it('Returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: getId(),
    userId: getId(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', getSigninCookie())
    .send({ token: 'test', orderId: order.id })
    .expect(401);
});

it('Returns a 404 when purchasing a cancelled order', async () => {
  const userId = getId();

  const order = Order.build({
    id: getId(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Canceled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', getSigninCookie(userId))
    .send({ token: 'test', orderId: order.id })
    .expect(400);
});

it('Returns a 204 with valid inputs', async () => {
  const userId = getId();

  const order = Order.build({
    id: getId(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', getSigninCookie(userId))
    .send({ token: 'tok_visa', orderId: order.id })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(order.price * 100);
  expect(chargeOptions.currency).toEqual('eur');

  const payment = await Payment.findOne({
    orderId: order.id,
  });
  expect(payment).not.toBeNull();
});
