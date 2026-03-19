import { ContactPage } from '@/pages';
import { Helmet } from 'react-helmet-async';

export const ContactRoute = () => {
  return (
    <>
      <Helmet>
        <title>Contact</title>
      </Helmet>
      <ContactPage />
    </>
  );
};
