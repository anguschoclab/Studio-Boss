/**
 * @vitest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NavLink } from '../../../src/components/NavLink';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';

const renderWithRouter = async (ui: React.ReactElement) => {
  const rootRoute = createRootRoute({
    component: () => <>{ui}</>,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div>Index</div>,
  });

  const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/test',
    component: () => <div>Test</div>,
  });

  const routeTree = rootRoute.addChildren([indexRoute, testRoute]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(<RouterProvider router={router} />);
  });

  return result;
};

describe('NavLink', () => {
  it('renders correctly and passes activeProps', async () => {
    await renderWithRouter(
      <NavLink to="/test" className="base-class" activeClassName="active-class">
        Test Link
      </NavLink>
    );

    const link = screen.getByRole('link', { name: 'Test Link' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('base-class');
  });

  it('forwards ref correctly', async () => {
    const ref = React.createRef<HTMLAnchorElement>();

    await renderWithRouter(
      <NavLink ref={ref} to="/test" className="base-class">
        Test Link
      </NavLink>
    );

    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current?.getAttribute('href')).toBe('/test');
  });
});
