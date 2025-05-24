// src/services/upload.ts
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadImage(file: File, userId: string): Promise<string> {
  const filePath = `projects/${userId}/${Date.now()}-${file.name}`;
  const imageRef = ref(storage, filePath);

  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);
  return url;
}
