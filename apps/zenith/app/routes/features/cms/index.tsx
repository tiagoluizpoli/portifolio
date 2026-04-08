import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/features/cms/')({
  beforeLoad: () => {
    throw redirect({
      to: '/features/cms/home',
    });
  },
});
