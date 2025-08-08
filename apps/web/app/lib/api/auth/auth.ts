// app/lib/api/auth.ts
import {client} from '../client';
import type { paths } from '../types';

// Make sure apiKey is passed correctly as a parameter
// export const loginWithGoogle = async (apiKey: string): Promise<paths['/api/v1/organization'].post> => {
//   const response = await client.post('/api/v1/organization', {
//     headers: {
//       'x-api-key': apiKey, // Use the passed apiKey
//     },
//     body: {
//       name: 'My Organization',
//       description: 'This is a test organization',
//       domain: 'mydomain.com',
//     },
//   });

//   if (response.error) {
//     throw new Error(response.error.error); // Handle errors gracefully
//   }

//   return response.data;
// };
