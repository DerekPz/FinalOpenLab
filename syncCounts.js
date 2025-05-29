const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } = require('firebase/firestore');

// Configuración de Firebase (asegúrate de reemplazar esto con tu configuración)
const firebaseConfig = {
  apiKey: "AIzaSyBqHu1RGlN2zqDO_21D1pnhgwv6oZVWcYE",
  authDomain: "openlab-e3d4c.firebaseapp.com",
  projectId: "openlab-e3d4c",
  storageBucket: "openlab-e3d4c.appspot.com",
  messagingSenderId: "1048472122965",
  appId: "1:1048472122965:web:a2d3d8fad3b2a2f5d7c8d7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncAllFollowCounts() {
  try {
    console.log('Starting follow count synchronization...');
    
    const usersRef = collection(db, 'userProfiles');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`Found ${usersSnapshot.size} users to process`);
    
    const batch = writeBatch(db);
    let updateCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      console.log(`Processing user ${userId}...`);
      
      // Contar seguidores
      const followersRef = collection(db, `userProfiles/${userId}/followers`);
      const followersSnapshot = await getDocs(followersRef);
      const followersCount = followersSnapshot.size;
      
      // Contar seguidos
      const followingRef = collection(db, `userProfiles/${userId}/following`);
      const followingSnapshot = await getDocs(followingRef);
      const followingCount = followingSnapshot.size;
      
      console.log(`User ${userId}: ${followersCount} followers, ${followingCount} following`);
      
      // Actualizar contadores en el perfil
      const userRef = doc(db, 'userProfiles', userId);
      batch.update(userRef, {
        followersCount,
        followingCount
      });
      
      updateCount++;
      
      // Commit batch cada 500 actualizaciones
      if (updateCount >= 500) {
        await batch.commit();
        console.log(`Committed batch of ${updateCount} updates`);
        updateCount = 0;
      }
    }
    
    // Commit final batch si hay actualizaciones pendientes
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${updateCount} updates`);
    }
    
    console.log('Successfully synchronized all follow counts');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing follow counts:', error);
    process.exit(1);
  }
}

// Ejecutar la sincronización
syncAllFollowCounts(); 