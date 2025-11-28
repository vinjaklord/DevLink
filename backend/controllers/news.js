import { News } from '../models/news.js';

const news = async (req, res, next) => {
  try {
    const data = await News.find();
    res.json(data);
  } catch (error) {
    console.error('Error fetching API data from data.json  |  ', error.message);
  }
};

export { news };
