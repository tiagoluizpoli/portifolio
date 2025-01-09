import type { ResumeSkills } from '@/core';
import {} from 'react-icons/fa';
import {} from 'react-icons/si';

// about data
export const about = {
  title: 'About me',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias, magnam doloremque minima quos autem numquam repudiandae.',
  info: [
    {
      fieldName: 'Name',
      fieldValue: 'Tiago Poli',
    },
    {
      fieldName: 'Phone',
      fieldValue: '(11) 95206-6489',
    },
    {
      fieldName: 'Experience',
      fieldValue: '12+ Years',
    },
    {
      fieldName: 'Skype',
      fieldValue: 'tyhh@live.com',
    },
    {
      fieldName: 'Nationality',
      fieldValue: 'Brazilian',
    },
    {
      fieldName: 'Email',
      fieldValue: 'tiago.seuaciuc@gmail.com',
    },
    {
      fieldName: 'Freelance',
      fieldValue: 'Availables',
    },
    {
      fieldName: 'Languages',
      fieldValue: 'Portuguese, English',
    },
  ],
};

// experience data
export const experience = {
  icon: 'assets/resume/badge.svg',
  title: 'My experience',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias, magnam doloremque minima quos autem numquam repudiandae.',
  items: [
    {
      company: 'Tech Solutions Inc.',
      position: 'Full Stack Developer',
      duration: '2021 - Present',
    },
    {
      company: 'Web Design Studio',
      position: 'Front-End Developer',
      duration: '2020 - 2021',
    },
    {
      company: 'E-commerce Startup',
      position: 'Full Stack Developer',
      duration: '2018 - 2020',
    },
    {
      company: 'Tech Academy',
      position: 'Full Stack Developer',
      duration: '2016 - 2018',
    },
    {
      company: 'Digital Agency',
      position: 'Full Stack Developer',
      duration: '2015 - 2016',
    },
    {
      company: 'Software Development Firm',
      position: 'Full Stack Developer',
      duration: '2013 - 2015',
    },
  ],
};

// education data
export const education = {
  icon: 'assets/resume/cap.svg',
  title: 'My education',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias, magnam doloremque minima quos autem numquam repudiandae.',
  items: [
    {
      institution: 'Uniasselvi',
      degree: 'Análise e Desenvolvimento de Sistemas',
      duration: '2023 - Present',
    },
  ],
};

// skills data
export const skills: ResumeSkills = {
  title: 'My skills',
  description:
    "I'm very passionate about good, cool and trending technologies. I am constantly learning and improving my skills to stay ahead in the industry.",
  items: [
    {
      type: 'frontend',
      icon: {
        lib: 'fa',
        name: 'FaHtml5',
      },
      title: 'html 5',
    },
    {
      type: 'frontend',
      icon: {
        lib: 'fa',
        name: 'FaCss3',
      },
      title: 'css 3',
    },
    {
      type: 'frontend',
      icon: {
        lib: 'fa',
        name: 'FaJs',
      },
      title: 'javascript',
    },
    {
      type: 'frontend',
      icon: {
        lib: 'fa',
        name: 'FaReact',
      },
      title: 'react.js',
    },
    {
      type: 'frontend',
      icon: {
        lib: 'si',
        name: 'SiVite',
      },
      title: 'vite.js',
    },
    {
      type: 'frontend',
      icon: {
        lib: 'si',
        name: 'SiTailwindcss',
      },
      title: 'tailwind.css',
    },
    {
      type: 'frontend',
      icon: {
        lib: 'si',
        name: 'SiMui',
      },
      title: 'Material UI',
    },
    {
      type: 'frontend',
      icon: {
        lib: 'si',
        name: 'SiShadcnui',
      },
      title: 'shadcn UI',
    },
    {
      type: 'fullstack',
      icon: {
        lib: 'si',
        name: 'SiTypescript',
      },
      title: 'typescript',
    },
    {
      type: 'fullstack',
      icon: {
        lib: 'si',
        name: 'SiNextdotjs',
      },
      title: 'next.js',
    },
    {
      type: 'fullstack',
      icon: {
        lib: 'fa',
        name: 'FaGit',
      },
      title: 'git',
    },
    {
      type: 'fullstack',
      icon: {
        lib: 'lia',
        name: 'LiaAws',
      },
      title: 'aws',
    },
    {
      type: 'fullstack',
      icon: {
        lib: 'fa',
        name: 'FaDigitalOcean',
      },
      title: 'digital ocean',
    },
    {
      type: 'fullstack',
      icon: {
        lib: 'si',
        name: 'SiVitest',
      },
      title: 'vitest',
    },
    {
      type: 'backend',
      icon: {
        lib: 'fa',
        name: 'FaNodeJs',
      },
      title: 'node.js',
    },
    {
      type: 'backend',
      icon: {
        lib: 'si',
        name: 'SiNestjs',
      },
      title: 'nest.js',
    },
    {
      type: 'backend',
      icon: {
        lib: 'si',
        name: 'SiExpress',
      },
      title: 'express.js',
    },
    {
      type: 'backend',
      icon: {
        lib: 'si',
        name: 'SiFastify',
      },
      title: 'fastify.js',
    },
    {
      type: 'backend',
      icon: {
        lib: 'ai',
        name: 'AiOutlineDotNet',
      },
      title: '.net',
    },
    {
      type: 'backend',
      icon: {
        lib: 'fa',
        name: 'FaDocker',
      },
      title: 'docker',
    },
    {
      type: 'backend',
      icon: {
        lib: 'bi',
        name: 'BiLogoPostgresql',
      },
      title: 'postgresql',
    },
    {
      type: 'backend',
      icon: {
        lib: 'io5',
        name: 'IoLogoFirebase',
      },
      title: 'firebase',
    },
    {
      type: 'backend',
      icon: {
        lib: 'si',
        name: 'SiAmazondynamodb',
      },
      title: 'amazon dynamodb',
    },
    {
      type: 'backend',
      icon: {
        lib: 'si',
        name: 'SiPrisma',
      },
      title: 'prisma',
    },
    {
      type: 'backend',
      icon: {
        lib: 'si',
        name: 'SiDrizzle',
      },
      title: 'drizzle.js',
    },
  ],
};
