export type Project = {
  id: string;
  title: string;
  description: string;
  visibility: 'public' | 'private';
  deleted?: boolean;
};
