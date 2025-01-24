import { type Language, useLangContext } from '@/providers/lang';
import { Icon } from '@iconify/react/dist/iconify.js';
import type { DialogCloseProps } from '@radix-ui/react-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';

interface LanguageOption {
  code: Language;
  key: string;
  icon: string;
}

const languages: LanguageOption[] = [
  { code: 'en-US', key: 'English', icon: 'flagpack:us' },
  { code: 'pt-BR', key: 'Português', icon: 'flagpack:br' },
];

interface Props {
  Close?: React.ForwardRefExoticComponent<DialogCloseProps & React.RefAttributes<HTMLButtonElement>>;
}
export const LanguageSelector = ({ Close }: Props) => {
  const { lang, setLang } = useLangContext();

  const handleLanguageChange = (languageCode: Language) => {
    setLang(languageCode);
  };

  return (
    <Select value={lang} onValueChange={handleLanguageChange} defaultValue="1">
      <SelectTrigger className="border-none">
        <div className="flex items-center gap-4 pe-2">
          <Icon
            icon={(languages.find((language) => language.code === lang) as LanguageOption).icon}
            className={'w-6 h-6'}
          />
          {lang}
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language, index) => (
          <SelectItem key={index} value={language.code}>
            {Close ? (
              <Close>
                <div className="flex gap-2">
                  <Icon icon={language.icon} className={'w-6 h-6'} />
                  {language.key}
                </div>
              </Close>
            ) : (
              <div className="flex gap-2">
                <Icon icon={language.icon} className={'w-6 h-6'} />
                {language.key}
              </div>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  // return (
  //   <div className="flex gap-4 justify-center items-center p-1">
  //     {languages.map((language) => (
  //       <button
  //         type="button"
  //         key={language.code}
  //         onClick={() => handleLanguageChange(language.code)}
  //         className={'rounded-full p-1 transition-colors'}
  //         aria-label={`Change language to ${language.key}`}
  //         aria-pressed={lang === language.code}
  //       >
  //         <motion.div
  //           initial={{
  //             scale: 1,
  //           }}
  //           animate={{
  //             scale: lang === language.code ? 1.4 : 1,
  //             transition: {
  //               duration: 0.2,
  //               ease: 'easeInOut',
  //             },
  //           }}
  //         >
  //           <Icon icon={language.icon} className={'w-6 h-6'} />
  //         </motion.div>
  //       </button>
  //     ))}
  //   </div>
  // );
};
