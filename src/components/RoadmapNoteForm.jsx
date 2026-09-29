import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { withShop } from '@/lib/shopScope';

const NEW_TOPIC = '__new__';

export default function RoadmapNoteForm({ note, topics, onClose, onSaved }) {
  const [title, setTitle] = useState(note?.title || '');
  const [details, setDetails] = useState(note?.details || '');
  const [topic, setTopic] = useState(note?.topic || topics[0] || NEW_TOPIC);
  const [newTopic, setNewTopic] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const chosen = topic === NEW_TOPIC ? newTopic.trim() : topic;
    if (!title.trim() || !chosen) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      details: details.trim(),
      topic: chosen,
    };
    try {
      if (note) {
        await base44.entities.RoadmapNote.update(note.id, payload);
      } else {
        await base44.entities.RoadmapNote.create(
          withShop({ ...payload, done: false })
        );
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note ? 'Edit Note' : 'Add Note'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-3">
          <div>
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Spreadsheet import for new shops"
              required
            />
          </div>
          <div>
            <Label>Topic *</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_TOPIC}>New topic…</SelectItem>
              </SelectContent>
            </Select>
            {topic === NEW_TOPIC && (
              <Input
                className="mt-2"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="New topic name"
              />
            )}
          </div>
          <div>
            <Label>Details</Label>
            <textarea
              value={details}
              autoCapitalize="sentences"
              onChange={(e) => setDetails(e.target.value)}
              className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="What it is, why it matters, anything to decide later…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}