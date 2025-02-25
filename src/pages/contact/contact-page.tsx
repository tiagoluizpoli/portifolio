import { type ContactTranslantion, useContactInfoQuery } from '@/core';

import { useLangContext } from '@/providers/lang';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ContactForm } from './contact-form';

export const ContactPage = () => {
  const { data, isLoading, isFetching } = useContactInfoQuery();

  const { getTranslation } = useLangContext();
  if (!data || isFetching || isLoading) {
    return null;
  }

  return (
    <div className="py-6">
      <div className="container mx-auto">
        <div className="flex flex-col xl:flex-row gap-[30px]">
          <div className="xl:w-[54%] order-2 xl:order-none">
            {/* form */}
            <ContactForm />
          </div>

          {/* info */}
          <div className="flex items-center flex-1 order-1 mb-8 xl:justify-start xl:order-none xl:mb-0">
            <ul className="flex flex-col gap-10">
              {data?.map((item, index) => {
                const translated = getTranslation<ContactTranslantion>(item.translations);

                return (
                  <li key={index} className="flex items-center gap-6">
                    <div className="w-[52px] h-[52px] xl:w-[72px] xl:h-[72px] bg-[#27272c] text-accent rounded-md flex items-center justify-center">
                      <div className="text-[28px]">
                        <Icon icon={item.iconCode} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/60 capitalize">{translated.type}</p>
                      <h3 className="text-xl">{item.value}</h3>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
