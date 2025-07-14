import { Fragment } from 'react';

import { NotificationHub } from '@douglasneuroinformatics/libui/components';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import '../services/axios';
import '../services/i18n';
import '../services/zod';

export const Route = createRootRoute({
  component: () => (
    <Fragment>
      <Outlet />
      <NotificationHub />
      <ReactQueryDevtools buttonPosition="bottom-right" position="left" />
      <TanStackRouterDevtools />
    </Fragment>
    // <>
    //   <div className="flex gap-2 p-2">
    //     <Link className="[&.active]:font-bold" to="/">
    //       Home
    //     </Link>{' '}
    //     <Link className="[&.active]:font-bold" to="/about">
    //       About
    //     </Link>
    //   </div>
    //   <hr />
    //   <Outlet />
    //   <TanStackRouterDevtools />
    // </>
  )
});
