import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// biome-ignore lint/style/useImportType: <explanation>
import { ResumeSkillsItem, ResumeSkillsJoinItem, ResumeTranslation, SkillListType, useResumeQuery } from '@/core';
import { useLangContext } from '@/providers/lang';
import { motion } from 'framer-motion';
import { SkillList } from './skill-list';

export const ResumePage = () => {
  const { data } = useResumeQuery();

  const { lang, getTranslation } = useLangContext();

  if (!data) {
    return <></>;
  }

  const translated = getTranslation<ResumeTranslation>(data.translations);

  const about = translated.about[0];
  const experience = translated.experience[0];
  const education = translated.education[0];
  const skills = translated.skills[0];

  const filteredSkills: Record<SkillListType, ResumeSkillsItem[]> = skills.items.reduce(
    (acc: Record<SkillListType, ResumeSkillsItem[]>, curr: ResumeSkillsJoinItem) => {
      if (curr.resume_skills_items_id.type === 'frontend') {
        acc.frontend.push(curr.resume_skills_items_id);
      }
      if (curr.resume_skills_items_id.type === 'backend') {
        acc.backend.push(curr.resume_skills_items_id);
      }
      if (curr.resume_skills_items_id.type === 'fullstack') {
        acc.fullstack.push(curr.resume_skills_items_id);
      }
      return acc;
    },
    {
      frontend: [],
      backend: [],
      fullstack: [],
    },
  );

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        transition: {
          delay: 0.4,
          duration: 0.4,
          ease: 'easeIn',
        },
      }}
      className="min-h-[80vh] flex items-center justify-center py-12 xl:py-0"
    >
      <div className="container mx-auto">
        <Tabs defaultValue="experience" className="flex flex-col xl:flex-row gap-[60px]">
          <TabsList className="flex flex-col w-full max-w-[380px] mx-auto xl:mx-0 gap-6">
            <TabsTrigger value={'experience'}>{lang === 'en-US' ? 'Experience' : 'Experiência'}</TabsTrigger>
            <TabsTrigger value={'education'}>{lang === 'en-US' ? 'Education' : 'Educação'}</TabsTrigger>
            <TabsTrigger value={'skills'}>{lang === 'en-US' ? 'Skills' : 'Habilidades'}</TabsTrigger>
            <TabsTrigger value={'about'}>{lang === 'en-US' ? 'About me' : 'Sobre mim'}</TabsTrigger>
          </TabsList>
          <div className="min-h-[70vh] w-full">
            {/* experience */}
            <TabsContent value="experience" className="w-full">
              <div className="flex flex-col gap-[30px] text-center xl:text-left">
                <h3 className="text-4xl font-bold">{experience.title}</h3>
                <p className="max-w-[600px] text-white/60 mx-auto xl:mx-0">{experience.description}</p>
                <ScrollArea className="h-[400px]">
                  <ul className="grid grid-cols-1 lg:grid-cols-2 gap-[30px]">
                    {experience.items.map((item, index) => {
                      return (
                        <li
                          key={index}
                          className="bg-[#232329] h-[184px] py-6 px-10 rounded-xl flex flex-col justify-center items-center lg:items-start gap-1"
                        >
                          <span className="text-accent">{item.duration}</span>
                          <h3 className="text-xl max-w-[260px] min-h-[60px] text-center lg:text-left">
                            {item.position}
                          </h3>
                          <div className="flex items-center gap-3">
                            {/* dot */}
                            <span className="w-[6px] h-[6px] rounded-full bg-accent" />

                            <p className="text-white/60">{item.company}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* education */}
            <TabsContent value="education" className="w-full">
              <div className="flex flex-col gap-[30px] text-center xl:text-left">
                <h3 className="text-4xl font-bold">{education.title}</h3>
                <p className="max-w-[600px] text-white/60 mx-auto xl:mx-0">{education.description}</p>
                <ScrollArea className="h-[400px]">
                  <ul className="grid grid-cols-1 lg:grid-cols-2 gap-[30px]">
                    {education.items.map((item, index) => {
                      return (
                        <li
                          key={index}
                          className="bg-[#232329] min-h-[184px] py-6 px-10 rounded-xl flex flex-col justify-center items-center lg:items-start gap-1"
                        >
                          <span className="text-accent">{item.duration}</span>
                          <h3 className="text-xl max-w-[260px] min-h-[60px] text-center lg:text-left">{item.degree}</h3>
                          <div className="flex items-center gap-3">
                            {/* dot */}
                            <span className="w-[6px] h-[6px] rounded-full bg-accent" />

                            <p className="text-white/60">{item.institution}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* skills */}
            <TabsContent value="skills" className="w-full h-full">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-[30px] text-center xl:text-left">
                  <h3 className="text-4xl font-bold">{skills.title}</h3>
                  <p className="max-w-[600px] text-white/60 mx-auto xl:mx-0">{skills.description}</p>
                </div>
                <ScrollArea className="h-[400px] pe-4">
                  <div className="flex flex-col gap-8">
                    <SkillList title="Backend" skills={filteredSkills.backend} />
                    <SkillList title="Frontend" skills={filteredSkills.frontend} />
                    <SkillList title="Fullstack" skills={filteredSkills.fullstack} />
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* about */}
            <TabsContent value="about" className="w-full text-center xl:text-left">
              <div className="flex flex-col gap-[30px]">
                <h3 className="text-4xl font-bold">{about.title}</h3>
                <p className="max-w-[600px] text-white/60 mx-auto xl:mx-0">{about.description}</p>
                <ul className="grid grid-cols-1 gap-y-6 max-w-[620px] mx-auto xl:mx-0">
                  {about.info.map((item, index) => {
                    return (
                      <li key={index} className="flex items-center justify-center xl:justify-start gap-4">
                        <span className="text-white/60 text-sm">{item.fieldName}</span>
                        <span className="text-lg">{item.fieldValue}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
};
