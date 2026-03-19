import { AnimatePagePresence, Header, Loading } from '@/components';
import { useIsFetching } from '@tanstack/react-query';

export const PublicApp = () => {
  const isFetching = useIsFetching();

  if (isFetching > 0) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      <AnimatePagePresence />
    </>
  );
};
