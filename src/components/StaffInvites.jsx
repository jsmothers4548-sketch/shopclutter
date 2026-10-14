import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import StaffInviteDialog from '@/components/StaffInviteDialog';
import { UserPlus, Trash2, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StaffInvites({ locked = false }) {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [showInvite, setShowInvite] = useState(false);

  const load = useCallback(async () => {
    const data = await base44.entities.StaffInvite.list('-created_date', 50);
    setInvites(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const remove = async (invite) => {
    if (!window.confirm(`Remove the invitation for ${invite.email}?`)) return;
    setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    await base44.entities.StaffInvite.delete(invite.id);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-bold text-slate-900">Staff Logins</h2>
          <p className="text-xs text-slate-500">
            {locked
              ? 'Included on Pro and up'
              : 'Give your crew access to this shop only'}
          </p>
        </div>
        {locked ? (
          <Button size="sm" variant="outline" onClick={() => navigate('/billing')}>
            <Lock className="w-4 h-4" /> Invite
          </Button>
        ) : (
          <Button size="sm" onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4" /> Invite
          </Button>
        )}
      </div>

      {invites.length > 0 && (
        <div className="space-y-1.5">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
            >
              <span className="flex items-center gap-2 min-w-0 text-sm text-slate-700">
                <Mail className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="truncate">{invite.email}</span>
              </span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    invite.status === 'joined'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {invite.status === 'joined' ? 'Joined' : 'Invited'}
                </span>
                <button
                  onClick={() => remove(invite)}
                  className="p-1 text-slate-300 hover:text-red-500"
                  aria-label="Remove invitation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {showInvite && (
        <StaffInviteDialog
          onClose={() => setShowInvite(false)}
          onInvited={load}
        />
      )}
    </div>
  );
}