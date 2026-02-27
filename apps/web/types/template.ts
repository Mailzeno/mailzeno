export interface Template {
  id: string;
  template_key?: string;
  name: string;
  subject: string;
  body: string;
  usage_count?: number;
  category?: string;
}
