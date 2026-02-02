import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.test
const envPath = path.resolve(__dirname, '../.env.test');
dotenv.config({ path: envPath });
