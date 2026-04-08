import { createFileRoute } from '@tanstack/react-router';
import { HomeForm } from '@/features/cms/components/sections/home-form';

export const Route = createFileRoute('/features/cms/home')({
  component: HomeSection,
});

function HomeSection() {
  return <HomeForm />;
}
