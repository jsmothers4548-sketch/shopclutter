import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Palette, Check, Upload, Trash2, Lock } from 'lucide-react';
import { getShopSettings } from '@/lib/shopSettings';
import useShop from '@/hooks/useShop';
import { getPlan, canWhiteLabel } from '@/lib/plans';
import { withShop } from '@/lib/shopScope';

const FALLBACK = { brand_name: 'Shop Clutter', brand_logo_url: '' };

export default function BrandingForm() {
  const { shop, loading: shopLoading } = useShop();
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
          brand_address: s.brand_address || '',
          brand_phone: s.brand_phone || '',
          brand_email: s.brand_email || '',
        });
      })
      .catch(() => setForm({ ...FALLBACK }));
  }, []);

  if (shopLoading) return null;

  if (!canWhiteLabel(getPlan(shop?.plan_id))) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
          <Lock className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="font-bold text-slate-900">Branding is a paid feature</h2>
        <p className="text-sm text-slate-500">
          Put your own logo and business name on the app, your estimates and your invoices.
          Available on Pro, Team and Multi-Location.
        </p>
        <Button asChild className="w-full">
          <Link to="/billing">Upgrade your plan</Link>
        </Button>
      </div>
    );
  }

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
      brand_address: form.brand_address || '',
      brand_phone: form.brand_phone || '',
      brand_email: form.brand_email || '',
    };
    if (record) {
      await base44.entities.ShopSettings.update(record, payload);
    } else {
      const created = await base44.entities.ShopSettings.create(
        withShop(payload)
      );
      setRecord(created.id);
    }
    setSaving(false);
    setSaved(true);
  };

  return (
    <form
      onSubmit={save}
      className="flex max-h-[85dvh] flex-col bg-white"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-3 pr-12">
        <Palette className="w-4 h-4 shrink-0 text-amber-600" />
        <h2 className="font-bold text-slate-900">Branding</h2>
        <span className="min-w-0 truncate text-xs text-slate-400">
          Your shop's name and logo
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
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

      <div>
        <Label htmlFor="brand_address">Business Address</Label>
        <Input
          id="brand_address"
          type="text"
          value={form.brand_address}
          onChange={(e) => setForm({ ...form, brand_address: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="brand_phone">Business Phone</Label>
        <Input
          id="brand_phone"
          type="text"
          value={form.brand_phone}
          onChange={(e) => setForm({ ...form, brand_phone: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="brand_email">Business Email</Label>
        <Input
          id="brand_email"
          type="email"
          value={form.brand_email}
          onChange={(e) => setForm({ ...form, brand_email: e.target.value })}
        />
        <p className="text-xs text-slate-400 mt-1">
          Address, phone, and email appear on printed invoices
        </p>
      </div>

      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
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