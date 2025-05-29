// src/components/BaseModal.tsx

import * as React from 'react';

import Modal from 'react-modal';
import '../styles/scrollbar.css';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode; // Contenido principal del modal (el formulario)
  footerContent?: React.ReactNode; // Contenido para el área de los botones
  // Puedes añadir una prop para el contentLabel si quieres que sea diferente del title en algunos casos
  // contentLabel?: string;
}

export default function BaseModal({ isOpen, onClose, title, children, footerContent }: BaseModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      // Usamos el title como contentLabel por defecto, puedes añadir una prop específica si es necesario.
      contentLabel={title}
      // CLASES DE ESTILO DEL MODAL (tomadas de CreateProjectModal, que es más completo)
      className="
        relative
        w-full max-w-2xl
        mx-4 sm:mx-auto mt-5 sm:mt-10 /* Manteniendo tu margin-top para que no choque con la barra superior */
        bg-white dark:bg-zinc-800
        p-6 sm:p-8 rounded-lg shadow-xl outline-none
        flex flex-col
        max-h-[90vh]
      "
      // CLASES DE ESTILO DEL OVERLAY
      overlayClassName="fixed inset-0 z-50 flex justify-center items-center bg-gradient-to-br from-black/70 via-zinc-900/60 to-black/70 backdrop-blur-sm px-2"
      // Prop para deshabilitar el scroll del body
      htmlOpenClassName="ReactModal__Html--open"
    >
      {/* Título del Modal */}
      <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">{title}</h2>

      {/* Este div contendrá el contenido principal (el formulario) y tendrá el SCROLL */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar-styling">
        {children} {/* Aquí se renderizará el contenido específico del modal (tu formulario) */}
      </div>

      {/* Área para los botones del pie de página */}
      {footerContent && (
        <div className="flex justify-end gap-4 pt-4 mt-auto">
          {footerContent}
        </div>
      )}
    </Modal>
  );
}