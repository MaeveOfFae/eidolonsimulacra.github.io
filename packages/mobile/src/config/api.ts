import { CharacterGeneratorAPI } from '@char-gen/shared';

// For mobile, we need to use an absolute URL
// In development, this is typically localhost
// In production, this would be your deployed API URL
const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api'
  : 'https://your-api-url.com/api';

export const api = new CharacterGeneratorAPI(API_BASE_URL);
