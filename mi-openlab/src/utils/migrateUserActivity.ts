import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { firebaseConfig } from './firebase.migrate.config';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateProjects() {
  const projectsSnap = await getDocs(collection(db, 'projects'));
  for (const docSnap of projectsSnap.docs) {
    const data = docSnap.data();
    await addDoc(collection(db, 'userActivities'), {
      userId: data.userId,
      type: 'create_project',
      description: `Creaste el proyecto "${data.title}"`,
      relatedId: docSnap.id,
      timestamp: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    });
    // Likes
    if (Array.isArray(data.likedBy)) {
      for (const likerId of data.likedBy) {
        await addDoc(collection(db, 'userActivities'), {
          userId: likerId,
          type: 'like',
          description: `Diste like al proyecto "${data.title}"`,
          relatedId: docSnap.id,
          timestamp: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        });
      }
    }
  }
}

async function migrateFavorites() {
  const usersSnap = await getDocs(collection(db, 'userProfiles'));
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const favoritesSnap = await getDocs(collection(db, `userProfiles/${userId}/favorites`));
    for (const favDoc of favoritesSnap.docs) {
      await addDoc(collection(db, 'userActivities'), {
        userId,
        type: 'favorite',
        description: `Marcaste como favorito el proyecto con ID "${favDoc.id}"`,
        relatedId: favDoc.id,
        timestamp: favDoc.data().timestamp instanceof Timestamp ? favDoc.data().timestamp.toDate() : new Date(),
      });
    }
  }
}

async function migrateDiscussionsAndResponses() {
  const communitiesSnap = await getDocs(collection(db, 'communities'));
  for (const commDoc of communitiesSnap.docs) {
    const communityId = commDoc.id;
    const discussionsSnap = await getDocs(collection(db, `communities/${communityId}/discussions`));
    for (const discDoc of discussionsSnap.docs) {
      const discData = discDoc.data();
      await addDoc(collection(db, 'userActivities'), {
        userId: discData.authorId,
        type: 'create_discussion',
        description: `Publicaste en la comunidad "${commDoc.data().name || communityId}"`,
        relatedId: discDoc.id,
        timestamp: discData.createdAt instanceof Timestamp ? discData.createdAt.toDate() : new Date(),
      });
      // Respuestas
      const responsesSnap = await getDocs(collection(db, `communities/${communityId}/discussions/${discDoc.id}/responses`));
      for (const respDoc of responsesSnap.docs) {
        const respData = respDoc.data();
        await addDoc(collection(db, 'userActivities'), {
          userId: respData.authorId,
          type: 'comment',
          description: `Comentaste en la discusión "${discData.title}"`,
          relatedId: discDoc.id,
          timestamp: respData.createdAt instanceof Timestamp ? respData.createdAt.toDate() : new Date(),
        });
      }
    }
  }
}

async function migrateDeletedProjects() {
  const projectsSnap = await getDocs(collection(db, 'projects'));
  for (const docSnap of projectsSnap.docs) {
    const data = docSnap.data();
    if (data.deleted === true) {
      await addDoc(collection(db, 'userActivities'), {
        userId: data.userId,
        type: 'delete_project',
        description: `Eliminaste el proyecto "${data.title}"`,
        relatedId: docSnap.id,
        timestamp: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
      });
    }
  }
}

async function main() {
  console.log('Migrando proyectos y likes...');
  await migrateProjects();
  console.log('Migrando proyectos eliminados...');
  await migrateDeletedProjects();
  console.log('Migrando favoritos...');
  await migrateFavorites();
  console.log('Migrando discusiones y respuestas...');
  await migrateDiscussionsAndResponses();
  console.log('¡Migración completada!');
}

main().catch(console.error); 