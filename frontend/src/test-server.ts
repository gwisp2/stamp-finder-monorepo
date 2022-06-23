import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const baseUrl = 'http://localhost';
export const defaultHandlers = [rest.all(`${baseUrl}/*`, (_, res, ctx) => res(ctx.status(404), ctx.body('404')))];
export const server = setupServer(...defaultHandlers);
