import request from 'supertest';
import { app } from '../../app';
import { getId, getSigninCookie } from '../../test/helper';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the provided id does not exist', async () => {
  await request(app)
    .put(`/api/tickets/${getId()}`)
    .set('Cookie', getSigninCookie())
    .send({
      title: 'test title',
      price: 20,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  await request(app)
    .put(`/api/tickets/${getId()}`)
    .send({
      title: 'test title',
      price: 20,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const [title, price] = ['test title', 20];

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', getSigninCookie())
    .send({
      title,
      price,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', getSigninCookie())
    .send({
      title: 'test updated title',
      price: 1000,
    })
    .expect(401);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it('returns a 400 if the user provides invalid title or price', async () => {
  const [title, price, cookie] = ['test title', 20, getSigninCookie()];

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title,
      price,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 1000,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'test title',
      price: -200,
    })
    .expect(400);
});

it('updates the ticket with provided valid inputs', async () => {
  const [title, price, cookie] = ['test title', 20, getSigninCookie()];
  const [updatedTitle, updatedPrice] = ['new title', 100];

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title,
      price,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: updatedTitle,
      price: updatedPrice,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(updatedTitle);
  expect(ticketResponse.body.price).toEqual(updatedPrice);
});

it('publishes an event', async () => {
  const [title, price, cookie] = ['test title', 20, getSigninCookie()];
  const [updatedTitle, updatedPrice] = ['new title', 100];

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title,
      price,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: updatedTitle,
      price: updatedPrice,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects update if the ticket is reserved', async () => {
  const [title, price, cookie] = ['test title', 20, getSigninCookie()];
  const [updatedTitle, updatedPrice] = ['new title', 100];

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title,
      price,
    });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: getId() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: updatedTitle,
      price: updatedPrice,
    })
    .expect(400);
});
