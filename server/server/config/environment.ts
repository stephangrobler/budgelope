const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = `mongodb://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_DATABASE}${process.env.MONGO_DB_PARAMETERS}`;
export default { MONGO_URI, JWT_SECRET }