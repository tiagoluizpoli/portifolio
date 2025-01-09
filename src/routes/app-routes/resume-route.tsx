import { ResumePage } from '@/pages';
import { Helmet } from 'react-helmet-async';

export const ResumeRoute = () => {
  return (
    <>
      <Helmet>
        <title>Resume</title>
      </Helmet>
      <ResumePage />
    </>
  );
};
