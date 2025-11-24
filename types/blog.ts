// types/blog.ts
export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt?: string
  slug: string
  author_id: string
  author_name: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface CreateBlogPost {
  title: string
  content: string
  excerpt?: string
  slug: string
  is_published?: boolean
}