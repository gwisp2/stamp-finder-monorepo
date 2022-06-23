import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme from 'enzyme';
import fetch, { Request } from 'node-fetch';
import { baseUrl, server } from 'test-server';

// Setup Enzyme
Enzyme.configure({ adapter: new Adapter() });

// Setup fetch mock
(global.fetch as unknown as typeof fetch) = fetch;
(global.Request as unknown as typeof Request) = Request;

// Configure fetch mock
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(async () => {
  server.close();
  await new Promise((resolve) => setTimeout(resolve, 5));
});

// Setup base URLs
process.env.REACT_APP_DATA_URL = `${baseUrl}/data`;
process.env.REACT_APP_CALL_URL = `${baseUrl}/api`;
