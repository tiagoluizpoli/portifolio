import { createFileRoute } from '@tanstack/react-router';
import { ExperienceForm } from '@/features/cms/components/sections/experience/experience-form';

export const Route = createFileRoute('/features/cms/experience')({
  component: ExperienceSection,
});

function ExperienceSection() {
  return <ExperienceForm />;
}
