import useShop from '@/hooks/useShop';
import { getPlan, hasFeature } from '@/lib/plans';

// Tells a screen whether the shop's plan includes a feature.
// `locked` stays false while the plan is still loading, so nothing flashes.
export default function usePlanFeature(key) {
  const { shop, loading } = useShop();
  const plan = getPlan(shop?.plan_id);
  return {
    plan,
    shop,
    loading,
    locked: !loading && !hasFeature(plan, key),
  };
}