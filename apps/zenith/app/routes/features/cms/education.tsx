import { createFileRoute } from '@tanstack/react-router';
import { EducationForm } from '@/features/cms/components/sections/education-form';

export const Route = createFileRoute('/features/cms/education')({
  component: EducationSection,
});

function EducationSection() {
  return <EducationForm />;
}
