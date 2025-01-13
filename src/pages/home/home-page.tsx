import { Button } from '@/components/ui/button';
import { buildFileUrl, useHomeQuery, useResumeQuery } from '@/core';
import { FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Photo, Social, Stats } from './components';

export const HomePage = () => {
  const { data, isFetching, isLoading } = useHomeQuery();
  const { data: resume, isLoading: isResumeLoading, isFetching: isResumeFetching } = useResumeQuery();

  if (isFetching || isLoading || isResumeFetching || isResumeLoading) {
    return <div className="flex justify-center">Loading...</div>;
  }

  if (!data || !resume) {
    return <div className="flex justify-center">No Data</div>;
  }

  const totalCommits = data?.github[0]?.totalCommits ?? 0;
  const totalRepositories = data?.github[0]?.totalRepositories ?? 0;
  const technologiesMastered = resume.skills[0].items.length;

  return (
    <section className="h-full ">
      <div className="container mx-auto h-full">
        <div className="flex flex-col xl:flex-row items-center justify-between xl:pt-8 xl:pb-24 xl:gap-8">
          {/* text */}
          <div className="text-center xl:text-left order-2">
            <span className="text-xl">{data?.title}</span>
            <h1 className="h1 mb-6">
              {"Hello I'm"}
              <br />
              <span className="text-accent">{`${data.firstName} ${data?.lastName}`}</span>
            </h1>
            <p className="max-w-[500px] mb-9 text-white/80">{data?.description}</p>

            {/* btn and socials */}

            <div className="flex flex-col xl:flex-row items-center gap-8">
              <Link to={buildFileUrl(data.cv, true)} target="_blank" download>
                <Button variant={'outline'} size={'lg'} className="uppercase flex items-center gap-2">
                  <span>Download CV</span>
                  <FiDownload className="text-xl" />
                </Button>
              </Link>

              <div className="mb-8 xl:mb-0">
                <Social
                  socials={data?.socials}
                  containerStyles="flex gap-6"
                  iconStyles="w-9 h-9 border border-accent rounded-full flex justify-center items-center text-accent hover:bg-accent hover:text-primary hover:transition-all duration-500"
                />
              </div>
            </div>
          </div>

          {/* photo */}
          <div className="order-1 mb-8 xl:mb-0">
            <Photo picture={buildFileUrl(data.picture)} />
          </div>
        </div>
      </div>
      <Stats
        yearsOfExperience={data?.JourneyStartedIn ?? 0}
        totalCommits={totalCommits}
        totalRepositories={totalRepositories}
        technologiesMastered={technologiesMastered}
      />
    </section>
  );
};
