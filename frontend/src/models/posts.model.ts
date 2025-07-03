export interface IComments {
  _id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface IPost {
  _id: string;
  author: string;
  caption?: string;
  imageUrl: string;
  imageFileId: string;
  likes?: string[];
  comments?: IComments[];
  createdAt: string;
}
