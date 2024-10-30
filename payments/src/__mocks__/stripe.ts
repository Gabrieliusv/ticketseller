import { getId } from '../test/helper';

export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({ id: getId() }),
  },
};
