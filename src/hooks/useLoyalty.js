import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { withShopAll } from '@/lib/shopScope';

// How many times each customer has been in the shop, counted from the job
// tickets themselves — one grouped count on the server rather than tallying a
// loaded page of jobs.
//
// For an administrator it also keeps the milestone reminders: one per customer
// per milestone, created the first time the shop sees that customer reach it.
// Everyone else gets the visit counts only.
export default function useLoyalty(isAdmin) {
  const [visitCounts, setVisitCounts] = useState({});
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const grouped = await base44.entities.Job.aggregate({
        groupBy: 'customer_id',
      });
      const counts = {};
      (grouped?.rows || []).forEach((row) => {
        if (row.customer_id) counts[row.customer_id] = row.count || 0;
      });
      setVisitCounts(counts);

      if (!isAdmin) {
        setReminders([]);
        return;
      }

      const [milestoneList, existing] = await Promise.all([
        base44.entities.LoyaltyMilestone.list('visit_count', 200),
        base44.entities.LoyaltyReminder.list('-created_date', 500),
      ]);
      const milestones = Array.isArray(milestoneList) ? milestoneList : [];
      const known = Array.isArray(existing) ? existing : [];

      const already = new Set(
        known.map((r) => `${r.customer_id}|${r.milestone_id}`)
      );
      const needed = [];
      Object.entries(counts).forEach(([customerId, visitCount]) => {
        milestones.forEach((m) => {
          const threshold = Number(m.visit_count) || 0;
          if (
            threshold > 0 &&
            visitCount >= threshold &&
            !already.has(`${customerId}|${m.id}`)
          ) {
            needed.push({
              customer_id: customerId,
              milestone_id: m.id,
              milestone_visit_count: threshold,
              discount_type: m.discount_type || 'percentage',
              discount_value: Number(m.discount_value) || 0,
              status: 'pending',
            });
          }
        });
      });

      let created = [];
      if (needed.length) {
        const ids = [...new Set(needed.map((n) => n.customer_id))];
        const customerPage = await base44.entities.Customer.filter({
          id: { $in: ids },
        });
        const names = {};
        (customerPage?.items || []).forEach((c) => {
          names[c.id] = c.name;
        });
        const rows = needed
          .filter((n) => names[n.customer_id])
          .map((n) => ({ ...n, customer_name: names[n.customer_id] }));
        if (rows.length) {
          const saved = await base44.entities.LoyaltyReminder.bulkCreate(
            withShopAll(rows)
          );
          created = Array.isArray(saved) ? saved : [];
        }
      }

      setReminders(
        [...known, ...created]
          .filter((r) => r.status === 'pending')
          .sort(
            (a, b) =>
              (Number(b.milestone_visit_count) || 0) -
              (Number(a.milestone_visit_count) || 0)
          )
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  return { visitCounts, reminders, loading, reload: load };
}