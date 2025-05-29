import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import type { UserCredential, ActionCodeSettings } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { createUserProfile, getUserProfile } from './userProfile';

export async function registerUser(email: string, password: string, displayName: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Actualizar el displayName
    await updateProfile(user, { displayName });

    // Crear un perfil básico para el usuario
    await createUserProfile(user.uid, {
      displayName,
      email,
      bio: '',
      techStack: [],
      photoURL: user.photoURL || '',
      linkedInUrl: '',
      githubUrl: '',
      websiteUrl: '',
    });

    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    console.log('Initiating Google sign in');
    const result = await signInWithPopup(auth, googleProvider);
    
    // Verificar si el usuario ya tiene un perfil
    const existingProfile = await getUserProfile(result.user.uid);
    
    // Si no existe un perfil, crear uno nuevo con los datos de Google
    if (!existingProfile) {
      await createUserProfile(result.user.uid, {
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        bio: '',
        techStack: [],
        photoURL: result.user.photoURL || '',
        linkedInUrl: '',
        githubUrl: '',
        websiteUrl: '',
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error in signInWithGoogle:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    const actionCodeSettings: ActionCodeSettings = {
      // URL que se abrirá después de hacer clic en el enlace del correo
      url: window.location.origin + '/reset-password',
      // Manejar el código en la misma pestaña/ventana
      handleCodeInApp: true
    };

    await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
} 