import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Camera, X } from 'lucide-react';
import { withShop } from '@/lib/shopScope';

export default function TimelineForm({ jobId, stage, onClose, onSaved }) {
  const [notes, setNotes] = useState('');
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        files.map((f) => base44.integrations.Core.UploadFile({ file: f }))
      );
      setPhotoUrls([...photoUrls, ...urls.map((u) => u.file_url)]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.JobTimeline.create(
        withShop({
          job_id: jobId,
          stage,
          notes,
          photo_urls: photoUrls,
        })
      );
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Timeline Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="What did you do? What did you find?"
            />
          </div>
          <div>
            <Label>Photos</Label>
            <div className="flex gap-2 flex-wrap mt-1">
              {photoUrls.map((url, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img
                    src={url}
                    className="w-full h-full object-cover rounded-lg"
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoUrls(photoUrls.filter((_, idx) => idx !== i))
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 active:bg-slate-50"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            {uploading && (
              <p className="text-xs text-amber-600 mt-1">Uploading...</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? 'Saving...' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}