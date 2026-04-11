import { createFileRoute, Outlet } from '@tanstack/react-router';
import { CmsMainLayout } from '@/features/cms/layout';

export const Route = createFileRoute('/portfolio-cms')({
  component: CmsLayout,
});

function CmsLayout() {
  return (
    <CmsMainLayout>
      <Outlet />
    </CmsMainLayout>
  );
}
