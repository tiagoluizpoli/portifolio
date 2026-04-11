import { createFileRoute } from '@tanstack/react-router';
import { SkillsForm } from '@/features/cms/components/sections/skills';

export const Route = createFileRoute('/portfolio-cms/skills')({
  component: SkillsSection,
});

function SkillsSection() {
  return <SkillsForm />;
}
