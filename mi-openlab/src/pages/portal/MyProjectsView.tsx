import { useEffect, useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import CreateProjectModal from '../../components/CreateProjectModal';
import type { Project } from '../../data/types';




export default function MyProjectsView() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Función reutilizable para obtener proyectos
const fetchProjects = async () => {
  if (!user) return;
  const q = query(
    collection(db, 'projects'),
    where('userId', '==', user.uid)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Project))
    .filter(project => !project.deleted); // <- ahora sí compila
  setProjects(results);
};


  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar proyecto?',
      text: 'Esta acción marcará el proyecto como eliminado. ¿Deseas continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await updateDoc(doc(db, 'projects', id), { deleted: true });
      setProjects(prev => prev.filter(p => p.id !== id));
      Swal.fire('¡Eliminado!', 'El proyecto fue eliminado correctamente.', 'success');
    }
  };

  // 👤 Si no hay usuario autenticado, no renderiza nada (ni error)
  if (!user) return null;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center border-b border-zinc-700 pb-4">
        <h2 className="text-3xl font-bold text-darkText dark:text-white">Mis proyectos</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <PlusCircle size={18} />
          Crear proyecto
        </button>
      </div>

      <CreateProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onProjectCreated={fetchProjects}
      />

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-zinc-400 py-32">
          <span className="text-6xl mb-2">📁</span>
          <p className="text-xl font-medium">Aún no tienes proyectos creados.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-zinc-900 p-5 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
              <p className="text-sm text-zinc-400 mb-2">{project.description}</p>
              <span className="text-xs bg-zinc-800 text-white px-2 py-1 rounded">
                {project.visibility === 'private' ? 'Privado' : 'Público'}
              </span>
              <div className="flex gap-2 mt-4">
                <button className="text-sm text-yellow-400 hover:underline flex items-center gap-1">
                  <Edit size={16} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-sm text-red-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
