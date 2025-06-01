import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCommunity,
  isCommunityMember,
  joinCommunity,
  leaveCommunity,
  getUserCommunityRole
} from '../services/community';
import {
  getCommunityDiscussions,
  createDiscussion,
  getDiscussionResponses,
  addResponse
} from '../services/discussion';
import { getUserProfile } from '../services/userProfile';
import BaseModal from '../components/BaseModal';
import type { Community, Discussion, DiscussionType, Response } from '../types/community';
import { logUserActivity } from '../services/userActivity';
import { ArrowLeft } from 'lucide-react';

export default function CommunityView() {
  const { communityId } = useParams<{ communityId: string }>();
  const { user, loading: userLoading } = useAuth();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responsesError, setResponsesError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [authorProfiles, setAuthorProfiles] = useState<Record<string, { displayName: string, photoURL?: string }>>({});

  // Formulario para crear post
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<DiscussionType>('question');
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    if (!communityId) return;
    setLoading(true);
    (async () => {
      try {
        const comm = await getCommunity(communityId);
        setCommunity(comm);
        if (user) {
          const member = await isCommunityMember(communityId, user.uid);
          setIsMember(member);
          const userRole = await getUserCommunityRole(communityId, user.uid);
          setRole(userRole);
        } else {
          setIsMember(false);
          setRole(null);
        }
        const disc = await getCommunityDiscussions(communityId, 20);
        setDiscussions(disc);
      } catch (e) {
        setError('No se pudo cargar la comunidad');
      } finally {
        setLoading(false);
      }
    })();
  }, [communityId, user]);

  const handleJoin = async () => {
    if (!user || !communityId) return;
    setActionLoading(true);
    try {
      await joinCommunity(communityId, user.uid);
      setIsMember(true);
      setRole('member');
    } catch (e: any) {
      setError(e.message || 'Error al unirse');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!user || !communityId) return;
    setActionLoading(true);
    try {
      await leaveCommunity(communityId, user.uid);
      setIsMember(false);
      setRole(null);
    } catch (e: any) {
      setError(e.message || 'Error al dejar la comunidad');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !communityId) return;
    setCreating(true);
    setError(null);
    try {
      await createDiscussion(
        communityId,
        title,
        content,
        user.uid,
        type,
        [] // No tags
      );
      setModalOpen(false);
      setTitle('');
      setContent('');
      setType('question');
      setAttachment(null);
      // Recargar discusiones
      const disc = await getCommunityDiscussions(communityId, 20);
      setDiscussions(disc);
      await logUserActivity(
        user.uid,
        'create_discussion',
        `Publicaste en la comunidad "${community?.name}"`,
        communityId,
        { title }
      );
    } catch (e: any) {
      setError(e.message || 'Error al crear publicación');
    } finally {
      setCreating(false);
    }
  };

  // Permitir crear publicación si es miembro o owner
  const canCreate = isMember || (user && community && community.creatorId === user.uid);

  // Cargar respuestas cuando se abre el modal de detalle
  useEffect(() => {
    if (!detailModalOpen || !selectedDiscussion || !communityId) return;
    setResponsesLoading(true);
    setResponsesError(null);
    (async () => {
      try {
        const res = await getDiscussionResponses(communityId, selectedDiscussion.id, 50);
        setResponses(res);
      } catch (e) {
        setResponsesError('No se pudieron cargar los comentarios');
      } finally {
        setResponsesLoading(false);
      }
    })();
  }, [detailModalOpen, selectedDiscussion, communityId]);

  // Manejar envío de comentario
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !communityId || !selectedDiscussion || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      await addResponse(communityId, selectedDiscussion.id, newComment, user.uid);
      setNewComment('');
      // Recargar respuestas
      const res = await getDiscussionResponses(communityId, selectedDiscussion.id, 50);
      setResponses(res);
    } catch (e) {
      setResponsesError('No se pudo enviar el comentario');
    } finally {
      setCommentLoading(false);
    }
  };

  // Cargar perfiles de autores de discusiones al cargar discusiones
  useEffect(() => {
    if (!communityId) return;
    (async () => {
      const authorIds = Array.from(new Set(discussions.map(d => d.authorId)));
      const profiles: Record<string, { displayName: string, photoURL?: string }> = {};
      await Promise.all(authorIds.map(async (uid) => {
        if (!uid) return;
        try {
          const prof = await getUserProfile(uid);
          if (prof) profiles[uid] = { displayName: prof.displayName, photoURL: prof.photoURL };
        } catch {}
      }));
      setAuthorProfiles(profiles);
    })();
  }, [discussions, communityId]);

  // Cargar perfiles de autores de respuestas al abrir modal de detalle
  useEffect(() => {
    if (!detailModalOpen || !selectedDiscussion || !communityId) return;
    (async () => {
      const authorIds = Array.from(new Set(responses.map(r => r.authorId)));
      const profiles: Record<string, { displayName: string, photoURL?: string }> = { ...authorProfiles };
      await Promise.all(authorIds.map(async (uid) => {
        if (!uid || profiles[uid]) return;
        try {
          const prof = await getUserProfile(uid);
          if (prof) profiles[uid] = { displayName: prof.displayName, photoURL: prof.photoURL };
        } catch {}
      }));
      setAuthorProfiles(profiles);
    })();
  }, [responses, detailModalOpen, selectedDiscussion, communityId]);

  if (loading || userLoading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!community) return <div className="p-8">Comunidad no encontrada</div>;

  const isOwner = user && community.creatorId === user.uid;

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-zinc-50 dark:bg-zinc-900 py-8 px-2">
      {/* Header minimalista */}
      <div className="w-full max-w-2xl flex flex-col items-center mb-4 mt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 text-center flex-1">
            {community.name}
          </h1>
          {/* Botón seguir/dejar de seguir */}
          {!isOwner && user && (
            isMember ? (
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold shadow min-w-[120px]"
                onClick={handleLeave}
                disabled={actionLoading}
              >
                {actionLoading ? 'Cargando...' : 'Dejar de seguir'}
              </button>
            ) : (
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold shadow min-w-[120px]"
                onClick={handleJoin}
                disabled={actionLoading}
              >
                {actionLoading ? 'Cargando...' : 'Seguir'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Reglas de la comunidad */}
      {community.rules && community.rules.length > 0 && (
        <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-xl shadow p-5 border border-zinc-200 dark:border-zinc-700 mb-4">
          <h2 className="text-lg font-bold mb-2 text-indigo-600 dark:text-indigo-400">Reglas de la comunidad</h2>
          <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-1">
            {community.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal para crear publicación */}
      <BaseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Crear publicación"
        footerContent={
          <>
            <button
              className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white px-4 py-2 rounded-lg"
              onClick={() => setModalOpen(false)}
              disabled={creating}
            >
              Cancelar
            </button>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"
              type="submit"
              form="create-discussion-form"
              disabled={creating}
            >
              {creating ? 'Creando...' : 'Publicar'}
            </button>
          </>
        }
      >
        <form id="create-discussion-form" onSubmit={handleCreateDiscussion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg bg-zinc-100 dark:bg-zinc-800"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contenido</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg bg-zinc-100 dark:bg-zinc-800"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              className="w-full px-3 py-2 border rounded-lg bg-zinc-100 dark:bg-zinc-800"
              value={type}
              onChange={e => setType(e.target.value as DiscussionType)}
            >
              <option value="question">Pregunta</option>
              <option value="resource">Recurso</option>
              <option value="debate">Debate</option>
              <option value="announcement">Anuncio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adjuntar archivo (imagen o PDF, opcional)</label>
            <label className="flex items-center gap-3 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold w-fit">
              <span>Seleccionar archivo</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={e => setAttachment(e.target.files?.[0] || null)}
              />
            </label>
            {attachment && <div className="mt-2 text-xs text-zinc-500">Archivo seleccionado: {attachment.name}</div>}
          </div>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </BaseModal>

      {/* Lista de publicaciones/discusiones */}
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-xl shadow p-6 border border-zinc-200 dark:border-zinc-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Publicaciones recientes</h2>
          {canCreate && (
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold shadow"
              onClick={() => setModalOpen(true)}
            >
              Crear publicación
            </button>
          )}
        </div>
        {discussions.length === 0 ? (
          <div className="text-zinc-500">Aún no hay publicaciones en esta comunidad.</div>
        ) : (
          <div className="space-y-4">
            {discussions.map(disc => (
              <div
                key={disc.id}
                className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-100 dark:border-zinc-700 shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-400 transition"
                onClick={() => { setSelectedDiscussion(disc); setDetailModalOpen(true); }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
                    {disc.type}
                  </span>
                  <span className="text-xs text-zinc-400">{new Date(disc.createdAt).toLocaleString()}</span>
                  {authorProfiles[disc.authorId] && (
                    <span className="flex items-center gap-1 ml-2">
                      <img src={authorProfiles[disc.authorId].photoURL || '/default-avatar.png'} alt="avatar" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-xs text-zinc-700 dark:text-zinc-200 font-medium">{authorProfiles[disc.authorId].displayName}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold mb-1 text-zinc-900 dark:text-white">{disc.title}</h3>
                <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-1 line-clamp-3">{disc.content}</div>
                {/* Tags eliminados */}
                <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1">
                  <span>👍 {disc.upvotes}</span>
                  <span>💬 {disc.responseCount}</span>
                  <span>👁️ {disc.views}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalle de publicación */}
      <BaseModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedDiscussion?.title || ''}
      >
        {selectedDiscussion && (
          <div>
            {/* Botón de cerrar (X) en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-xl font-bold focus:outline-none"
              onClick={() => setDetailModalOpen(false)}
              aria-label="Cerrar"
              type="button"
            >
              ×
            </button>
            {/* Info del autor de la publicación */}
            <div className="flex items-center gap-2 mb-2 mt-2">
              <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
                {selectedDiscussion.type}
              </span>
              <span className="text-xs text-zinc-400">{new Date(selectedDiscussion.createdAt).toLocaleString()}</span>
              {authorProfiles[selectedDiscussion.authorId] && (
                <span className="flex items-center gap-1 ml-2">
                  <img src={authorProfiles[selectedDiscussion.authorId].photoURL || '/default-avatar.png'} alt="avatar" className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-xs text-zinc-700 dark:text-zinc-200 font-medium">{authorProfiles[selectedDiscussion.authorId].displayName}</span>
                </span>
              )}
            </div>
            <div className="text-base text-zinc-900 dark:text-white mb-2 font-semibold">{selectedDiscussion.title}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-4 whitespace-pre-line">{selectedDiscussion.content}</div>
            <div className="text-xs text-zinc-500 mt-4 flex gap-4">
              <span>👍 {selectedDiscussion.upvotes}</span>
              <span>💬 {selectedDiscussion.responseCount}</span>
              <span>👁️ {selectedDiscussion.views}</span>
            </div>
            {/* Comentarios/respuestas */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-3 text-indigo-600 dark:text-indigo-400">Comentarios</h3>
              {responsesLoading ? (
                <div className="text-zinc-500">Cargando comentarios...</div>
              ) : responsesError ? (
                <div className="text-red-500">{responsesError}</div>
              ) : responses.length === 0 ? (
                <div className="text-zinc-500">Aún no hay comentarios.</div>
              ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {responses.map(resp => (
                    <div key={resp.id} className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-zinc-500">{new Date(resp.createdAt).toLocaleString()}</span>
                        {authorProfiles[resp.authorId] && (
                          <span className="flex items-center gap-1 ml-2">
                            <img src={authorProfiles[resp.authorId].photoURL || '/default-avatar.png'} alt="avatar" className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-xs text-zinc-700 dark:text-zinc-200 font-medium">{authorProfiles[resp.authorId].displayName}</span>
                          </span>
                        )}
                        {resp.isAccepted && <span className="text-xs text-green-600 font-bold ml-2">✔ Respuesta aceptada</span>}
                      </div>
                      <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-line">{resp.content}</div>
                    </div>
                  ))}
                </div>
              )}
              {/* Caja para comentar */}
              {user ? (
                isMember ? (
                  <form onSubmit={handleAddComment} className="mt-6 flex gap-2 items-end">
                    <textarea
                      className="flex-1 px-3 py-2 border rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm resize-none"
                      rows={2}
                      placeholder="Escribe un comentario..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      disabled={commentLoading}
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"
                      disabled={commentLoading || !newComment.trim()}
                    >
                      {commentLoading ? 'Enviando...' : 'Comentar'}
                    </button>
                  </form>
                ) : (
                  <div className="mt-6 text-zinc-500 text-sm">Sigue la comunidad para poder comentar.</div>
                )
              ) : (
                <div className="mt-6 text-zinc-500 text-sm">Inicia sesión para comentar.</div>
              )}
            </div>
          </div>
        )}
      </BaseModal>

      {/* Botón flotante de volver a Comunidades */}
      <button
        onClick={() => navigate('/communities')}
        className="fixed bottom-20 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-zinc-900/90 text-white dark:bg-zinc-800/90 dark:text-zinc-100 rounded-full shadow-lg hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-all backdrop-blur-md"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        aria-label="Volver a Comunidades"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium hidden sm:inline">Volver a Comunidades</span>
      </button>
      {/* Botón flotante de ir a Explorar */}
      <button
        onClick={() => navigate('/explore')}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-zinc-900/90 text-white dark:bg-zinc-800/90 dark:text-zinc-100 rounded-full shadow-lg hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-all backdrop-blur-md"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        aria-label="Ir a Explorar"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium hidden sm:inline">Ir a Explorar</span>
      </button>
    </div>
  );
}
