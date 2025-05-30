import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCommunityMembers, removeCommunityMember, getUserProfile } from "../../services/community";
import { useAuth } from "../../context/AuthContext";
import type { CommunityMember } from "../../types/community";
import BaseModal from "../../components/BaseModal";

type MemberWithProfile = CommunityMember & {
  displayName?: string;
  email?: string;
};

export default function AdminCommunityView() {
  const { communityId } = useParams<{ communityId: string }>();
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<MemberWithProfile | null>(null);

  useEffect(() => {
    if (!communityId) return;
    (async () => {
      const membersRaw = await getCommunityMembers(communityId);
      // Cargar perfiles en paralelo
      const membersWithProfiles = await Promise.all(
        membersRaw.map(async (member) => {
          const profile = await getUserProfile(member.userId);
          return {
            ...member,
            displayName: profile?.displayName || "",
            email: profile?.email || "",
          };
        })
      );
      setMembers(membersWithProfiles);
      setLoading(false);
    })();
  }, [communityId]);

  if (loading) return <div>Cargando miembros...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Administrar comunidad</h1>
      <p className="mb-6">ID de la comunidad: {communityId}</p>
      <h2 className="text-xl font-semibold mb-2">Miembros</h2>
      <ul className="space-y-2">
        {members.map(member => (
          <li
            key={member.userId}
            className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-lg p-3 shadow"
          >
            <span>
              {member.userId === user?.uid ? (
                <span className="font-bold text-indigo-600">
                  {member.displayName || member.email || "Tú (creador)"}
                  {" "} (Tú)
                </span>
              ) : (
                <span>
                  {member.displayName || member.email || member.userId}
                </span>
              )}
            </span>
            {member.userId !== user?.uid && (
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  setMemberToRemove(member);
                  setModalOpen(true);
                }}
              >
                Eliminar
              </button>
            )}
          </li>
        ))}
      </ul>
      <BaseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirmar eliminación"
        footerContent={
          <>
            <button
              className="bg-zinc-500 hover:bg-zinc-600 text-white px-4 py-2 rounded"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              onClick={async () => {
                if (memberToRemove && communityId) {
                  await removeCommunityMember(communityId, memberToRemove.userId);
                  setMembers(members.filter(m => m.userId !== memberToRemove.userId));
                  setModalOpen(false);
                  setMemberToRemove(null);
                }
              }}
            >
              Eliminar
            </button>
          </>
        }
      >
        <p>
          ¿Estás seguro de que quieres eliminar a{" "}
          <span className="font-semibold">
            {memberToRemove?.displayName || memberToRemove?.email || memberToRemove?.userId}
          </span>{" "}
          de la comunidad?
        </p>
      </BaseModal>
    </div>
  );
} 