import { useForm } from 'react-hook-form';
import Modal from 'react-modal';
import { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

Modal.setAppElement('#root');

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

interface ProjectFormData {
  title: string;
  description: string;
  tags: string;
  visibility: 'public' | 'private';
  github?: string;
  demo?: string;
}

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>();

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'projects'), {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()),
        createdAt: Timestamp.now(),
        userId: user.uid,
        deleted: false,
        imageUrl: '', // se puede actualizar luego
      });
      reset();
      onClose();
      onProjectCreated();
    } catch (err) {
      console.error('Error al crear el proyecto:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Crear Proyecto"
      className="max-w-2xl mx-auto mt-20 bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-xl outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-start"
    >
      <h2 className="text-2xl font-bold mb-6 text-darkText dark:text-white">Crear nuevo proyecto</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('title', { required: 'El título es obligatorio' })}
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

        <div className="flex gap-4">
          <input
            {...register('github')}
            className="w-full px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 placeholder:text-sm text-darkText dark:text-white"
            placeholder="Enlace GitHub (opcional)"
          />
          <input
            {...register('demo')}
            className="w-full px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 placeholder:text-sm text-darkText dark:text-white"
            placeholder="Enlace demo (opcional)"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-darkText dark:text-white">
            <input type="radio" value="public" {...register('visibility')} defaultChecked />
            Público
          </label>
          <label className="flex items-center gap-2 text-sm text-darkText dark:text-white">
            <input type="radio" value="private" {...register('visibility')} />
            Privado
          </label>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-zinc-500 hover:bg-zinc-600 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium"
          >
            {loading ? 'Creando...' : 'Crear proyecto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
