import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/portfolio-cms/')({
  beforeLoad: () => {
    throw redirect({
      to: '/portfolio-cms/home',
    });
  },
});
