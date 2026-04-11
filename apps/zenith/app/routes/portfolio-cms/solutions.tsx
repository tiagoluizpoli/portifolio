import { createFileRoute } from '@tanstack/react-router';
import { SolutionsForm } from '@/features/cms/components/sections/solutions';

export const Route = createFileRoute('/portfolio-cms/solutions')({
  component: SolutionsSection,
});

function SolutionsSection() {
  return <SolutionsForm />;
}
