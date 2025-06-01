// src/components/UpdateProjectModal.tsx

import React, { useState, useEffect } from 'react'; // Asegúrate de importar React
import { useForm } from 'react-hook-form';
import type { Project } from '../data/types'; // Asegúrate de que la ruta sea correcta
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { uploadImage } from '../services/upload';
import { logUserActivity } from '../services/userActivity';

import BaseModal from './BaseModal'; // Importa el BaseModal

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
  project: Project;
}

// Define la interfaz del formulario para tener un tipado correcto
interface ProjectFormData {
  title: string;
  description: string;
  tags: string; // Asume que las tags se manejarán como un string separado por comas en el formulario
  visibility: 'public' | 'private';
  githubUrl?: string;
  demoUrl?: string;
}

export default function UpdateProjectModal({ isOpen, onClose, onProjectUpdated, project }: Props) {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ProjectFormData>();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(project.imageUrl || ''); // Initial state from project

  useEffect(() => {
    // Solo actualiza el formulario si el modal está abierto y tenemos un proyecto
    if (isOpen && project) {
      setValue('title', project.title || '');
      setValue('description', project.description || '');
      // Asegúrate de que tags se convierta a un string separado por comas si es un array
      setValue('tags', Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''));
      setValue('visibility', project.visibility || 'public');
      setValue('githubUrl', project.githubUrl || '');
      setValue('demoUrl', project.demoUrl || '');
      setPreviewUrl(project.imageUrl || '');
    } else if (!isOpen) {
      // Limpiar el formulario y los estados de imagen al cerrar el modal
      reset();
      setImageFile(null);
      setPreviewUrl('');
    }
  }, [project, setValue, isOpen, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Si el usuario deselecciona la imagen, vuelve a la URL original del proyecto
      // o a nada si no había imagen original
      setPreviewUrl(project.imageUrl || '');
      setImageFile(null);
    }
  };

  const onSubmit = async (data: ProjectFormData) => { // Tipado de data a ProjectFormData
    setLoading(true);
    try {
      let imageUrlToSave = project.imageUrl; // Usar la URL existente por defecto
      if (imageFile) {
        // Si hay un nuevo archivo de imagen, subirlo
        imageUrlToSave = await uploadImage(imageFile, project.userId);
      }

      await updateDoc(doc(db, 'projects', project.id), {
        ...data,
        imageUrl: imageUrlToSave, // Guardar la URL final
        // Asegúrate de que las tags se conviertan a array antes de guardar en Firestore
        tags: data.tags.split(',').map((tag: string) => tag.trim()),
      });

      await logUserActivity(
        project.userId,
        'edit_project',
        `Editaste el proyecto "${data.title}"`,
        project.id
      );

      // Limpiar estados y formulario después del éxito
      reset();
      setImageFile(null);
      setPreviewUrl('');
      onProjectUpdated();
      onClose();
    } catch (err) {
      console.error('Error actualizando el proyecto:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el cierre del modal, incluyendo el reseteo del formulario
  const handleCloseModal = () => {
    reset(); // Resetea los campos del formulario
    setImageFile(null); // Limpia el archivo de imagen
    setPreviewUrl(project.imageUrl || ''); // Restaura la preview a la imagen original del proyecto o a vacío
    onClose(); // Llama a la función de cierre del modal del padre
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCloseModal} // Usa nuestra función de cierre personalizada
      title="Actualizar proyecto" // Título específico para el modal de actualización
      footerContent={
        <>
          <button
            type="button"
            onClick={handleCloseModal} // Usar handleCloseModal para Cancelar
            className="bg-zinc-500 hover:bg-zinc-600 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit(onSubmit)} // Conecta el botón al envío del formulario
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium"
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </>
      }
    >
      {/* Contenido del formulario va aquí como children del BaseModal */}
      {/* Hemos unificado las clases de los inputs para que sean consistentes con CreateProjectModal */}
      <form className="space-y-4">
        <div>
          <input
            {...register('title')}
            className="w-full px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 placeholder:text-sm text-darkText dark:text-white"
            placeholder="Título del proyecto"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 placeholder:text-sm text-darkText dark:text-white"
            placeholder="Descripción del proyecto"
          />
        </div>

        <div>
          <input
            {...register('tags')}
            className="w-full px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 placeholder:text-sm text-darkText dark:text-white"
            placeholder="Etiquetas (separadas por comas)"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            {...register('githubUrl')}
            className="w-full px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 placeholder:text-sm text-darkText dark:text-white"
            placeholder="Enlace GitHub (opcional)"
          />
          <input
            {...register('demoUrl')}
            className="w-full px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 placeholder:text-sm text-darkText dark:text-white"
            placeholder="Enlace demo (opcional)"
          />
        </div>

        <div>
          <label className="block text-sm text-darkText dark:text-white mb-1">Imagen destacada:</label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-zinc-600 px-6 py-10">
            <div className="text-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Vista previa" className="mt-4 max-h-48 mx-auto rounded-lg border border-zinc-300 dark:border-zinc-600" />
              ) : (
                <svg className="mx-auto size-12 text-zinc-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                </svg>
              )}
              <div className="mt-4 flex text-sm text-zinc-500">
                <label className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500">
                  <span>Subir un archivo</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                </label>
                <p className="pl-1">o arrastrar y soltar</p>
              </div>
              <p className="text-xs text-zinc-400">PNG, JPG, GIF hasta 10 MB</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-darkText dark:text-white">
            <input type="radio" value="public" {...register('visibility')} />
            Público
          </label>
          <label className="flex items-center gap-2 text-sm text-darkText dark:text-white">
            <input type="radio" value="private" {...register('visibility')} />
            Privado
          </label>
        </div>
      </form>
    </BaseModal>
  );
}