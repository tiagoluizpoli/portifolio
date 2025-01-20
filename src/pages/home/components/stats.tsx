'use client';
import { useLangContext } from '@/providers/lang';
import CountUp from 'react-countup';

interface Props {
  yearsOfExperience: number;
  totalCommits: number;
  totalRepositories: number;
  technologiesMastered: number;
}

export const Stats = ({ yearsOfExperience, totalCommits, totalRepositories, technologiesMastered }: Props) => {
  const { lang } = useLangContext();

  const stats = [
    {
      num: new Date().getFullYear() - yearsOfExperience,
      text: lang === 'en-US' ? 'Years of Experience' : 'Anos de Experiência',
    },
    {
      num: totalRepositories,
      text: lang === 'en-US' ? 'Total Repositories' : 'Total de Repositórios',
    },
    {
      num: technologiesMastered,
      text: lang === 'en-US' ? 'Technologies Mastered' : 'Tecnologias Aprendidas',
    },
    {
      num: totalCommits,
      text: lang === 'en-US' ? 'Total Commits' : 'Total de Commits',
    },
  ];

  return (
    <section className="pt-4 pb-12 xl:pt-0 xl:pb-0">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row flex-wrap gap-6 max-w-[80vw] xl:max-w-none">
          {stats.map((stat, index) => {
            return (
              <div key={index} className="flex-1 flex gap-4 items-center justify-center xl:justify-start">
                <CountUp end={stat.num} duration={5} delay={2} className="text-4xl xl:text-6xl font-extrabold" />
                <p
                  className={`${stat.text.length < 115 ? 'max-w-[100px]' : 'max-w-[150px]'} leading-snug text-white/80`}
                >
                  {stat.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
