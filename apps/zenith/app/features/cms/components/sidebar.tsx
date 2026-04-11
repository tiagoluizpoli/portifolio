import { Link, useLocation } from '@tanstack/react-router';
import {
  Briefcase,
  GraduationCap,
  Home,
  Lightbulb,
  Mail,
  User,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  { label: 'Home', icon: Home, to: '/portfolio-cms/home' },
  { label: 'About', icon: User, to: '/portfolio-cms/about' },
  { label: 'Experience', icon: Briefcase, to: '/portfolio-cms/experience' },
  { label: 'Education', icon: GraduationCap, to: '/portfolio-cms/education' },
  { label: 'Skills', icon: Zap, to: '/portfolio-cms/skills' },
  { label: 'Solutions', icon: Lightbulb, to: '/portfolio-cms/solutions' },
  { label: 'Contact', icon: Mail, to: '/portfolio-cms/contact' },
];

/**
 * CmsSidebar (Constitution §XVII, §I)
 * Secondary navigation rail for the Portfolio CMS sections.
 */
export function CmsSidebar() {
  const location = useLocation();

  return (
    <nav className="flex-1 px-2 space-y-1 mt-4" aria-label="Portfolio Sections">
      {sections.map((section) => {
        const isActive = location.pathname === section.to;
        return (
          <Link
            key={section.label}
            to={section.to}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group',
              isActive
                ? 'bg-primary/10 text-primary shadow-lg shadow-primary/5'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            <section.icon
              size={18}
              className={cn(
                'transition-transform duration-300',
                isActive ? 'scale-110' : 'group-hover:scale-110',
              )}
            />
            <span className="text-sm font-semibold tracking-tight font-manrope">
              {section.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
