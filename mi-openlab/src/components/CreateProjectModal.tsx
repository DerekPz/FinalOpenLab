import { useForm } from 'react-hook-form';
import Modal from 'react-modal';
import { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../services/upload';

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>();

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      let uploadedImageUrl = '';
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile, user.uid);
      }

      await addDoc(collection(db, 'projects'), {
        ...data,
        imageUrl: uploadedImageUrl,
        tags: data.tags.split(',').map(tag => tag.trim()),
        createdAt: Timestamp.now(),
        userId: user.uid,
        deleted: false,
      });
      reset();
      setPreviewUrl('');
      setImageFile(null);
      onClose();
      onProjectCreated();
    } catch (err) {
      console.error('Error al crear el proyecto:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
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

        <div>
          <label className="block text-sm text-darkText dark:text-white mb-1">Imagen destacada:</label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-zinc-500 px-6 py-10">
            <div className="text-center">
              <svg className="mx-auto size-12 text-zinc-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
              </svg>
              <div className="mt-4 flex text-sm text-zinc-500">
                <label className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 hover:text-indigo-500">
                  <span>Subir un archivo</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                </label>
                <p className="pl-1">o arrastrar y soltar</p>
              </div>
              <p className="text-xs text-zinc-400">PNG, JPG, GIF hasta 10 MB</p>
              {previewUrl && (
                <img src={previewUrl} alt="Vista previa" className="mt-4 max-h-48 mx-auto rounded-lg border border-zinc-300 dark:border-zinc-600" />
              )}
            </div>
          </div>
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
