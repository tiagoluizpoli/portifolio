import type { ResumeSkillsItem } from '@/core/entities';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';

interface Props {
  title: string;
  skills: ResumeSkillsItem[];
}

export const SkillList = ({ title, skills }: Props) => {
  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-4xl font-bold text-center xl:text-left">{title}</h3>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:gap-[30px] gap-4">
        {skills.map((skill, index) => {
          return (
            <li key={index}>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger className="w-full h-[100px] bg-[#232329] rounded-xl flex justify-center items-center group">
                    <div className="text-4xl group-hover:text-accent transition-all duration-300">
                      <Icon icon={skill.iconCode} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="capitalize">{skill.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
