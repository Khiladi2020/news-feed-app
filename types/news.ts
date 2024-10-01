type ArticleType = {
    id?: number;
    source:
        | {
              id: string;
              name: string;
          }
        | string;
    author: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
    isPinned?: 0 | 1;
};

export type { ArticleType };
