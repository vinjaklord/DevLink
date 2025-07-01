export interface Comments {
  _id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  author: string;
  caption?: string;
  imageUrl: string;
  imageFileId: string;
  likes?: string[];
  comments?: Comments[];
  createdAt: string;
}
