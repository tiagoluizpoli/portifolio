import type { Lib } from '@/components';

export interface Solution {
  id: string;
  sort: number;
  title: string;
  description: string;
  iconLib: Lib;
  iconCode: string;
}
