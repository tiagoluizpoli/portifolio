import { createFileRoute } from '@tanstack/react-router';
import { ContactForm } from '@/features/cms/components/sections/contact-form';

export const Route = createFileRoute('/features/cms/contact')({
  component: ContactSection,
});

function ContactSection() {
  return <ContactForm />;
}
