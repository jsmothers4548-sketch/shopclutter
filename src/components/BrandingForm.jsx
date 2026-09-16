import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Check, Upload, Trash2 } from 'lucide-react';
import { getShopSettings } from '@/lib/shopSettings';

const FALLBACK = { brand_name: 'Shop Clutter', brand_logo_url: '' };

export default function BrandingForm() {
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    getShopSettings()
      .then((s) => {
        setRecord(s.id || null);
        setForm({
          brand_name: s.brand_name || 'Shop Clutter',
          brand_logo_url: s.brand_logo_url || '',
        });
      })
      .catch(() => setForm({ ...FALLBACK }));
  }, []);

  if (!form) return null;

  const handleLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({
        file,
      });
      setForm((f) => ({ ...f, brand_logo_url: file_url }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const payload = {
      brand_name: form.brand_name?.trim() || 'Shop Clutter',
      brand_logo_url: form.brand_logo_url || '',
    };
    if (record) {
      await base44.entities.ShopSettings.update(record, payload);
    } else {
      const created = await base44.entities.ShopSettings.create(payload);
      setRecord(created.id);
    }
    setSaving(false);
    setSaved(true);
  };

  return (
    <form
      onSubmit={save}
      className="bg-white rounded-xl border border-slate-200 p-4 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-amber-600" />
        <h2 className="font-bold text-slate-900">Branding</h2>
        <span className="text-xs text-slate-400">
          Your shop's name and logo
        </span>
      </div>

      <div>
        <Label htmlFor="brand_name">Business Name</Label>
        <Input
          id="brand_name"
          type="text"
          value={form.brand_name}
          onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
        />
        <p className="text-xs text-slate-400 mt-1">
          Shown in the header, time clock, and printed documents
        </p>
      </div>

      <div>
        <Label>Logo</Label>
        <div className="flex items-center gap-3 mt-1">
          {form.brand_logo_url ? (
            <img
              src={form.brand_logo_url}
              alt="Logo preview"
              className="h-14 w-14 rounded-lg border border-slate-200 bg-white object-contain p-1"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
              <Palette className="w-5 h-5 text-slate-300" />
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogo}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Upload Logo'}
          </Button>
          {form.brand_logo_url && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm({ ...form, brand_logo_url: '' })}
            >
              <Trash2 className="w-4 h-4" /> Remove
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save Branding'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <Check className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}