import { createFileRoute } from '@tanstack/react-router';
import { SolutionsForm } from '@/features/cms/components/sections/solutions-form';

export const Route = createFileRoute('/portfolio-cms/solutions')({
  component: SolutionsSection,
});

function SolutionsSection() {
  return <SolutionsForm />;
}
