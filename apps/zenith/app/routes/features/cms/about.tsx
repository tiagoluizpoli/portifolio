import { createFileRoute } from '@tanstack/react-router';
import { AboutForm } from '@/features/cms/components/sections/about/about-form';

export const Route = createFileRoute('/features/cms/about')({
  component: AboutSection,
});

function AboutSection() {
  return <AboutForm />;
}
