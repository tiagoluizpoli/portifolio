import { type ElementType, useEffect, useState } from 'react';
import type { IconBaseProps } from 'react-icons';

const libs = [
  'ai',
  'bi',
  'bs',
  'cg',
  'ci',
  'di',
  'fa',
  'fa6',
  'fc',
  'fi',
  'gi',
  'go',
  'gr',
  'hi',
  'hi2',
  'im',
  'io',
  'io5',
  'lia',
  'lu',
  'md',
  'pi',
  'ri',
  'rx',
  'si',
  'sl',
  'tb',
  'tfi',
  'ti',
  'vsc',
  'wi',
] as const;

export type Lib = (typeof libs)[number];

export type IconProps = IconBaseProps & {
  name: string;
  lib: Lib;
};

const getIconComponent = async (lib: Lib, name: string) => {
  const module = await dynamicImportMapper[lib]();
  return module[name];
};

export const DynamicIcon = ({ name, lib, ...props }: IconProps) => {
  const [IconComponent, setIconComponent] = useState<ElementType | null>(null);

  useEffect(() => {
    (async () => {
      const importedIcon = await getIconComponent(lib, name);
      setIconComponent(() => importedIcon);
    })();
  }, [name]);

  if (!IconComponent) {
    return null;
  }

  return <IconComponent {...props} />;
};

const dynamicImportMapper: Record<Lib, () => Promise<any>> = {
  ai: () => import('react-icons/ai'),
  bi: () => import('react-icons/bi'),
  bs: () => import('react-icons/bs'),
  cg: () => import('react-icons/cg'),
  ci: () => import('react-icons/ci'),
  di: () => import('react-icons/di'),
  fa: () => import('react-icons/fa'),
  fa6: () => import('react-icons/fa6'),
  fc: () => import('react-icons/fc'),
  fi: () => import('react-icons/fi'),
  gi: () => import('react-icons/gi'),
  go: () => import('react-icons/go'),
  gr: () => import('react-icons/gr'),
  hi: () => import('react-icons/hi'),
  hi2: () => import('react-icons/hi2'),
  im: () => import('react-icons/im'),
  io: () => import('react-icons/io'),
  io5: () => import('react-icons/io5'),
  lia: () => import('react-icons/lia'),
  lu: () => import('react-icons/lu'),
  md: () => import('react-icons/md'),
  pi: () => import('react-icons/pi'),
  ri: () => import('react-icons/ri'),
  rx: () => import('react-icons/rx'),
  si: () => import('react-icons/si'),
  sl: () => import('react-icons/sl'),
  tb: () => import('react-icons/tb'),
  tfi: () => import('react-icons/tfi'),
  ti: () => import('react-icons/ti'),
  vsc: () => import('react-icons/vsc'),
  wi: () => import('react-icons/wi'),
};
