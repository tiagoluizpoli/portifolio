import { type Language, useLangContext } from '@/providers/lang';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface LanguageOption {
  code: Language;
  key: string;
  icon: string;
}

const languages: LanguageOption[] = [
  { code: 'en-US', key: 'English', icon: 'flagpack:us' },
  { code: 'pt-BR', key: 'Português', icon: 'flagpack:br' },
];

export const LanguageSelector = () => {
  const { lang, setLang } = useLangContext();

  const handleLanguageChange = (languageCode: Language) => {
    setLang(languageCode);
    // Here you would typically update the app's language setting
    console.log(`Language changed to ${languageCode}`);
  };

  return (
    <div className="flex gap-2 justify-center items-center  p-1">
      {languages.map((language) => (
        <button
          type="button"
          key={language.code}
          onClick={() => handleLanguageChange(language.code)}
          className={'rounded-full p-1 transition-colors'}
          aria-label={`Change language to ${language.key}`}
          aria-pressed={lang === language.code}
        >
          <motion.div
            initial={{
              scale: 1,
            }}
            animate={{
              scale: lang === language.code ? 1.4 : 1,
              transition: {
                duration: 0.2,
                ease: 'easeInOut',
              },
            }}
          >
            <Icon icon={language.icon} className={'w-4 h-4'} />
          </motion.div>
        </button>
      ))}
    </div>
  );
};
