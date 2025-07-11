interface Photo {
  url?: string;
  photoId?: string;
}
export interface IAuthor {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  photo?: Photo;
}

export interface IComments {
  _id: string;
  author: IAuthor; // Changed from string
  text: string;
  createdAt: string;
}

export interface IPost {
  _id: string;
  author: IAuthor; // Changed from string
  caption?: string;
  imageUrl: string;
  imageFileId: string;
  likes?: string[];
  comments?: IComments[];
  createdAt: string;
}
