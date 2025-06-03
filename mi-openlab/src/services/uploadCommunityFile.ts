import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadCommunityFile(file: File, communityId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileRef = ref(storage, `community_files/${communityId}/${Date.now()}.${ext}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}
