import Resume from '../constants/resume';

// Helper to make GET requests to Strapi
export async function fetchAPILocal() {
  const data = JSON.stringify(Resume);
  return data;
}