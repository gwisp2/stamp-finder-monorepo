import { AppRoot } from 'AppRoot';
import { StampCard } from 'components/StampCard';
import { StampInfoDropdown } from 'components/StampCard/StampInfoDropdown';
import { mount, MountRendererProps } from 'enzyme';
import { rest } from 'msw';
import { Component, ReactElement } from 'react';
import { act } from 'react-dom/test-utils';
import { baseUrl, server } from 'test-server';

const mountAndWait = async <C extends Component, P = C['props']>(
  node: ReactElement<P>,
  options?: MountRendererProps,
) => {
  const wrapper = mount(node, options);
  await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
  wrapper.update(); // Update Enzyme data
  return wrapper;
};

test.only('UI renders 404 error when no data', async () => {
  const wrapper = await mountAndWait(<AppRoot isServer={true} />);
  expect(wrapper.text().indexOf('HTTP 404') >= 0).toBe(true);
});

test.only('UI loads and renders stamps data', async () => {
  // Setup some stamp data
  server.use(
    rest.get(`${baseUrl}/data/stamps.json`, (_, res, ctx) =>
      res(
        ctx.json({
          '5': {
            name: 'Test stamp',
            page: '',
            image: 'x.png',
            value: 5,
            categories: [],
            year: 2000,
            series: '',
          },
        }),
      ),
    ),
  );
  server.use(rest.get(`${baseUrl}/data/shops.json`, (_, res, ctx) => res(ctx.json([]))));

  // Render the application
  const wrapper = await mountAndWait(<AppRoot isServer={true} />);

  const stampCard = wrapper.find(StampCard);
  expect(stampCard.text()).toContain('2000'); // check year is shown
  await act(async () => {
    stampCard.find(StampInfoDropdown).simulate('click');
  });
  expect(stampCard.text()).toContain('Test stamp'); // check name is shown
});
