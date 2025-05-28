import { useEffect, useState } from 'react';
// import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { PlusCircle } from 'lucide-react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import CreateProjectModal from '../../components/CreateProjectModal';
import UpdateProjectModal from '../../components/UpdateProjectModal';
import ProjectDetailModal from '../../components/ProjectDetailsModal';
import type { Project } from '../../data/types';

export default function MyProjectsView() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // Para mostrar detalle

  const fetchProjects = async () => {
    if (!user) return;
    const q = query(collection(db, 'projects'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Project))
      .filter(project => !project.deleted);
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
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      await updateDoc(doc(db, 'projects', id), { deleted: true });
      setProjects(prev => prev.filter(p => p.id !== id));
      Swal.fire('¡Eliminado!', 'El proyecto fue eliminado correctamente.', 'success');
    }
  };

  const handleEditClick = (project: Project) => {
    setProjectToEdit(project);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setProjectToEdit(null);
    fetchProjects();
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    fetchProjects();
  };

  const handleOpenDetails = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseDetails = () => {
    setSelectedProject(null);
    fetchProjects();
  };

  if (!user) return null;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center border-b border-zinc-700 pb-4">
        <h2 className="text-3xl font-bold text-darkText dark:text-white">Mis proyectos</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <PlusCircle size={18} />
          Crear proyecto
        </button>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onProjectCreated={fetchProjects}
      />

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-zinc-400 py-32">
          <span className="text-6xl mb-2">📁</span>
          <p className="text-xl font-medium">Aún no tienes proyectos creados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => handleOpenDetails(project)}
              className="cursor-pointer flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 overflow-hidden h-full"
            >
              <img
                className="object-cover h-48 w-full"
                src={project.imageUrl || 'https://via.placeholder.com/300'}
                alt={project.title}
              />
              <div className="flex flex-col justify-between p-4 leading-normal">
                <div className="flex justify-between items-center">
                  <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                    {project.title}
                  </h5>
                  <span className={`text-xs px-2 py-1 rounded ${project.visibility === 'private' ? 'bg-red-500' : 'bg-green-600'} text-white`}>
                    {project.visibility === 'private' ? 'Privado' : 'Público'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 my-2 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-1">
                  {project.tags?.map(tag => (
                    <span key={tag} className="bg-indigo-200 text-indigo-800 text-xs font-medium px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {projectToEdit && (
        <UpdateProjectModal
          isOpen={showUpdateModal}
          onClose={handleCloseUpdateModal}
          onProjectUpdated={fetchProjects}
          project={projectToEdit}
        />
      )}

      {selectedProject && (
        <ProjectDetailModal
          isOpen={true}
          project={selectedProject}
          onClose={handleCloseDetails}
          onEdit={() => handleEditClick(selectedProject)}
          onDelete={() => handleDelete(selectedProject.id)}
          isOwner={selectedProject.userId === user.uid}
        />
      )}
    </div>
  );
}
