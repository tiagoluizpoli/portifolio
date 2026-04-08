import { createFileRoute } from '@tanstack/react-router';
import { SkillsForm } from '@/features/cms/components/sections/skills-form';

export const Route = createFileRoute('/features/cms/skills')({
  component: SkillsSection,
});

function SkillsSection() {
  return <SkillsForm />;
}
