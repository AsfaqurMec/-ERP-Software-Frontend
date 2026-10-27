'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { api, money } from '../../../lib/api';
import {
  CurrencyDisplay,
  DataTable,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  StatCard,
  StatCardGrid,
  ErrorState,
} from '../../../components/ui';
import { ExportMenu } from '../../../components/export-menu';
import {
  Sparkles,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Coins,
  PackagePlus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Percent,
  ShoppingBag,
  Sliders,
  ShieldAlert,
  Lightbulb,
  Zap,
  RotateCcw,
  Activity,
  Layers,
  PhoneCall,
  DollarSign,
  Package,
  HelpCircle,
  Clock,
  Flame,
  Scale,
  Award,
} from 'lucide-react';

export default function OwnerIntelligencePage() {
  const [timeframe, setTimeframe] = useState('this_month');
  const [customFrom, setCustomFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [customTo, setCustomTo] = useState(new Date().toISOString().slice(0, 10));

  const [activeTab, setActiveTab] = useState<
    'overview' | 'restock' | 'pricing' | 'bcg' | 'simulator'
  >('overview');

  const [restockFilter, setRestockFilter] = useState<'ALL' | 'CRITICAL' | 'LOW' | 'HEALTHY' | 'OVERSTOCKED'>('ALL');
  const [pricingFilter, setPricingFilter] = useState<'ALL' | 'RAISE_MARGIN' | 'PREMIUM_BUMP' | 'CLEARANCE_DISCOUNT'>('ALL');
  const [bcgTab, setBcgTab] = useState<'stars' | 'cashCows' | 'opportunities' | 'deadStock'>('stars');

  // Interactive What-If Simulator States
  const [simPriceAdjustment, setSimPriceAdjustment] = useState(5); // +5%
  const [simVolumeGrowth, setSimVolumeGrowth] = useState(10); // +10%
  const [simExpenseCut, setSimExpenseCut] = useState(5); // -5%
  const [simDeadStockLiquidation, setSimDeadStockLiquidation] = useState(40); // 40% cleared

  const queryParams = new URLSearchParams({
    timeframe,
    ...(timeframe === 'custom' ? { from: customFrom, to: customTo } : {}),
  });

  const { data, isLoading, error, refetch, isFetching } = useQuery<any>({
    queryKey: ['owner-intelligence', queryParams.toString()],
    queryFn: () => api<any>(`/analytics/intelligence?${queryParams}`),
    staleTime: 60 * 1000,
  });

  const briefingQuery = useQuery<any>({
    queryKey: ['morning-action-briefing'],
    queryFn: () => api<any>('/analytics/intelligence/briefing'),
    staleTime: 60 * 1000,
  });

  const [completedActionIds, setCompletedActionIds] = useState<Set<string>>(new Set());
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const handleExecuteAction = async (action: any) => {
    if (action.actionType === 'SEND_WHATSAPP') {
      if (action.actionPayload?.url) {
        window.open(action.actionPayload.url, '_blank');
        setCompletedActionIds((prev) => new Set(prev).add(action.id));
        setActionToast(`💬 WhatsApp message opened for ${action.actionPayload.customerName}`);
        setTimeout(() => setActionToast(null), 4000);
      }
      return;
    }

    setExecutingActionId(action.id);
    try {
      const res = await api<any>('/analytics/intelligence/actions/execute', {
        method: 'POST',
        body: JSON.stringify({
          actionType: action.actionType,
          payload: action.actionPayload,
        }),
      });

      setCompletedActionIds((prev) => new Set(prev).add(action.id));
      setActionToast(res.message || 'Action executed successfully!');
      refetch();
      briefingQuery.refetch();
      setTimeout(() => setActionToast(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Action execution failed');
    } finally {
      setExecutingActionId(null);
    }
  };

  const timeframes = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  // Simulation calculations based on current 30-day forecast
  const simulationResults = useMemo(() => {
    if (!data?.futureProjections?.forecast30Days) {
      return { newRevenue: 0, newProfit: 0, profitDiff: 0, unlockedCash: 0, annualGain: 0 };
    }

    const baseRev = data.futureProjections.forecast30Days.projectedRevenue || 1;
    const baseCogs = data.futureProjections.forecast30Days.projectedCogs || 0;
    const baseExp = data.futureProjections.forecast30Days.projectedExpenses || 0;
    const baseProfit = data.futureProjections.forecast30Days.projectedNetProfit || 0;
    const trappedCash = data.executiveHighlights?.cashTrappedInDeadStock?.totalValue || 0;

    // Price adjustment directly affects revenue without increasing COGS
    // Volume growth scales both revenue and COGS
    const volumeMultiplier = 1 + simVolumeGrowth / 100;
    const priceMultiplier = 1 + simPriceAdjustment / 100;

    const newRev = baseRev * volumeMultiplier * priceMultiplier;
    const newCogs = baseCogs * volumeMultiplier;
    const newExp = baseExp * (1 - simExpenseCut / 100);
    const newProfit = newRev - newCogs - newExp;

    const profitDiff = newProfit - baseProfit;
    const unlockedCash = (trappedCash * simDeadStockLiquidation) / 100;
    const annualGain = profitDiff * 12;

    return {
      newRevenue: Math.round(newRev),
      newProfit: Math.round(newProfit),
      profitDiff: Math.round(profitDiff),
      unlockedCash: Math.round(unlockedCash),
      annualGain: Math.round(annualGain),
    };
  }, [data, simPriceAdjustment, simVolumeGrowth, simExpenseCut, simDeadStockLiquidation]);

  if (isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <PageContainer>
            <LoadingSpinner label="AI Decision Engine is synthesizing store data, product velocity, margins & strategic levers…" />
          </PageContainer>
        </Shell>
      </AuthGuard>
    );
  }

  if (error || !data) {
    return (
      <AuthGuard>
        <Shell>
          <PageContainer>
            <ErrorState
              message={error ? (error as any).message : 'Failed to load business intelligence data.'}
              onRetry={() => refetch()}
            />
          </PageContainer>
        </Shell>
      </AuthGuard>
    );
  }

  const { healthScore, executiveHighlights, restockGuide, pricingOptimizer, bcgMatrix, profitLevers, futureProjections } = data;

  const scoreColor =
    healthScore.rating === 'EXCELLENT'
      ? '#10b981'
      : healthScore.rating === 'GOOD'
      ? '#6366f1'
      : healthScore.rating === 'NEEDS_ATTENTION'
      ? '#f59e0b'
      : '#ef4444';

  const scoreBadgeBg =
    healthScore.rating === 'EXCELLENT'
      ? 'rgba(16, 185, 129, 0.12)'
      : healthScore.rating === 'GOOD'
      ? 'rgba(99, 102, 241, 0.12)'
      : healthScore.rating === 'NEEDS_ATTENTION'
      ? 'rgba(245, 158, 11, 0.12)'
      : 'rgba(239, 68, 68, 0.12)';

  // Filtered restock recommendations
  const filteredRestock = restockGuide.recommendations.filter((r: any) =>
    restockFilter === 'ALL' ? true : r.status === restockFilter
  );

  // Filtered pricing recommendations
  const filteredPricing = pricingOptimizer.recommendations.filter((p: any) =>
    pricingFilter === 'ALL' ? true : p.type === pricingFilter
  );

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          {/* Header */}
          <PageHeader
            title="Owner Intelligence & Decision Support"
            description="Executive advisory system analyzing inventory turnover, margins, pricing elasticity, procurement ROI, and scaling playbooks."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Owner Intelligence' }]}
            action={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
                  {timeframes.map((tf) => (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => setTimeframe(tf.id)}
                      style={{
                        border: 0,
                        background: timeframe === tf.id ? '#ffffff' : 'transparent',
                        color: timeframe === tf.id ? '#4f46e5' : '#64748b',
                        fontWeight: timeframe === tf.id ? 700 : 500,
                        fontSize: 12,
                        padding: '6px 11px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        boxShadow: timeframe === tf.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: isFetching ? 'wait' : 'pointer',
                  }}
                >
                  <RotateCcw size={14} className={isFetching ? 'animate-spin' : ''} />
                  <span>{isFetching ? 'Refreshing…' : 'Refresh'}</span>
                </button>
              </div>
            }
          />

          {timeframe === 'custom' && (
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                background: '#ffffff',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Custom Date Interval:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
              <span style={{ color: '#94a3b8' }}>to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>
          )}

          {/* Interactive Toast Notification */}
          {actionToast && (
            <div
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
              }}
            >
              <CheckCircle2 size={20} />
              {actionToast}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 60-SECOND DAILY EXECUTIVE ACTION BRIEFING & 1-CLICK RESOLUTION           */}
          {/* ========================================================================= */}
          {briefingQuery.data && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                padding: 24,
                marginBottom: 24,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                  marginBottom: 20,
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                      }}
                    >
                      <Zap size={13} /> {briefingQuery.data.greeting}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      Generated {new Date(briefingQuery.data.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                    ⚡ 60-Second Executive Action Center
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                    Real-time AI decisions synthesized across inventory runway, debt aging, and profit margins. Review and execute with 1 click.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ padding: '8px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fee2e2' }}>
                    <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>Capital at Risk</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>
                      {money(briefingQuery.data.summary?.capitalAtRisk || 0)}
                    </div>
                  </div>
                  <div style={{ padding: '8px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                    <div style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>Revenue Protected</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>
                      {money(briefingQuery.data.summary?.potentialRevenueProtection || 0)}
                    </div>
                  </div>
                  <div style={{ padding: '8px 14px', borderRadius: 8, background: '#eff6ff', border: '1px solid #dbeafe' }}>
                    <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>Profit Boost Opportunity</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#2563eb' }}>
                      +{money(briefingQuery.data.summary?.monthlyProfitBoostOpportunity || 0)}/mo
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Cards Grid */}
              {briefingQuery.data.actions?.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#16a34a', fontWeight: 600, fontSize: 14 }}>
                  🎉 All operational fronts are currently optimal! No critical stockouts, overdue debts, or margin anomalies require immediate action.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 16,
                  }}
                >
                  {briefingQuery.data.actions?.map((act: any) => {
                    const isDone = completedActionIds.has(act.id);
                    return (
                      <div
                        key={act.id}
                        style={{
                          borderRadius: 12,
                          border: isDone ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          background: isDone ? '#f0fdf4' : '#fafafa',
                          padding: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor:
                                  act.category === 'RESTOCK'
                                    ? '#dbeafe'
                                    : act.category === 'DEBT_COLLECTION'
                                    ? '#fef3c7'
                                    : act.category === 'PRICING'
                                    ? '#f3e8ff'
                                    : '#fee2e2',
                                color:
                                  act.category === 'RESTOCK'
                                    ? '#1e40af'
                                    : act.category === 'DEBT_COLLECTION'
                                    ? '#92400e'
                                    : act.category === 'PRICING'
                                    ? '#6b21a8'
                                    : '#991b1b',
                              }}
                            >
                              {act.category === 'RESTOCK'
                                ? '📦 REORDER ALERT'
                                : act.category === 'DEBT_COLLECTION'
                                ? '💰 DEBT COLLECTION'
                                : act.category === 'PRICING'
                                ? '🏷️ MARGIN OPTIMIZATION'
                                : '🚨 INVENTORY AUDIT'}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 4,
                                backgroundColor: act.severity === 'CRITICAL' ? '#fecaca' : '#fed7aa',
                                color: act.severity === 'CRITICAL' ? '#991b1b' : '#9a3412',
                              }}
                            >
                              {act.severity}
                            </span>
                          </div>

                          <h4 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                            {act.title}
                          </h4>
                          <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                            {act.description}
                          </p>

                          <div
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              color: '#0f172a',
                              marginBottom: 14,
                            }}
                          >
                            ⚡ {act.impactMetric}
                          </div>
                        </div>

                        <div>
                          {isDone ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#16a34a',
                              }}
                            >
                              <CheckCircle2 size={16} /> Action Executed
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleExecuteAction(act)}
                              disabled={executingActionId === act.id}
                              style={{
                                width: '100%',
                                padding: '9px 14px',
                                borderRadius: 8,
                                border: 0,
                                background:
                                  act.actionType === 'SEND_WHATSAPP'
                                    ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                                    : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: executingActionId === act.id ? 'not-allowed' : 'pointer',
                                opacity: executingActionId === act.id ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                              }}
                            >
                              {executingActionId === act.id ? (
                                'Processing…'
                              ) : (
                                <>
                                  {act.actionButtonText} <ArrowRight size={14} />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* HERO: EXECUTIVE BUSINESS HEALTH SCORE BANNER                              */}
          {/* ========================================================================= */}
          <div
            style={{
              background: 'linear-gradient(135deg, #181d33 0%, #1f2747 100%)',
              borderRadius: 16,
              padding: 24,
              color: '#ffffff',
              marginBottom: 24,
              boxShadow: '0 10px 25px -5px rgba(19, 23, 40, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Glow backdrop */}
            <div
              style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 250,
                height: 250,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0) 70%)',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 24,
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Left: Overall Health Score Gauge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div
                  style={{
                    width: 104,
                    height: 104,
                    borderRadius: '50%',
                    border: `6px solid ${scoreColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: 'rgba(255,255,255,0.04)',
                    boxShadow: `0 0 20px ${scoreColor}40`,
                  }}
                >
                  <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
                    {healthScore.totalScore}
                  </span>
                  <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
                    out of 100
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        background: scoreBadgeBg,
                        color: scoreColor,
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                      }}
                    >
                      {healthScore.rating.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Company Health Index</span>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 6px', color: '#f8fafc' }}>
                    Executive Decision Advisory
                  </h2>
                  <p style={{ fontSize: 12, color: '#cbd5e1', margin: 0, maxWidth: 360, lineHeight: 1.4 }}>
                    Synthesized from real transactions, inventory velocity, expense burdens, and profit margins.
                  </p>
                </div>
              </div>

              {/* Middle: 4 Micro-Bars for Score Components */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1', marginBottom: 3 }}>
                    <span>Profit Margin Health</span>
                    <strong>{healthScore.breakdown.profitMarginScore} / 25</strong>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(healthScore.breakdown.profitMarginScore / 25) * 100}%`, height: '100%', background: '#10b981' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1', marginBottom: 3 }}>
                    <span>Working Capital & Receivables</span>
                    <strong>{healthScore.breakdown.cashFlowScore} / 25</strong>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(healthScore.breakdown.cashFlowScore / 25) * 100}%`, height: '100%', background: '#6366f1' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1', marginBottom: 3 }}>
                    <span>Inventory Turnover & Freshness</span>
                    <strong>{healthScore.breakdown.inventoryEfficiencyScore} / 25</strong>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(healthScore.breakdown.inventoryEfficiencyScore / 25) * 100}%`, height: '100%', background: '#f59e0b' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1', marginBottom: 3 }}>
                    <span>Stockout Protection & Velocity</span>
                    <strong>{healthScore.breakdown.revenueMomentumScore} / 25</strong>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(healthScore.breakdown.revenueMomentumScore / 25) * 100}%`, height: '100%', background: '#06b6d4' }} />
                  </div>
                </div>
              </div>

              {/* Right: Key Algorithmic Observations */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Sparkles size={16} color="#818cf8" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', letterSpacing: 0.3 }}>
                    Strategic Takeaways
                  </span>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {healthScore.insights.slice(0, 3).map((insight: string, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 11.5, color: '#cbd5e1', lineHeight: 1.35 }}>
                      <span style={{ color: '#818cf8', fontWeight: 800 }}>•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4 HIGH-PRIORITY EXECUTIVE HIGHLIGHT CARDS                                 */}
          {/* ========================================================================= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
            {/* 1. Growth Engine */}
            <div className="card" style={{ padding: 18, borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Top Profit Engine</span>
                <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                  <Flame size={12} style={{ display: 'inline', marginRight: 3 }} />
                  {executiveHighlights.topGrowthEngine?.marginPct || 0}% Margin
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {executiveHighlights.topGrowthEngine?.name || 'No sales recorded'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Profit: <strong style={{ color: '#10b981' }}><CurrencyDisplay value={executiveHighlights.topGrowthEngine?.profit || 0} /></strong>
                {' '}• Rev: <CurrencyDisplay value={executiveHighlights.topGrowthEngine?.revenue || 0} />
              </div>
            </div>

            {/* 2. Trapped Capital */}
            <div className="card" style={{ padding: 18, borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Trapped in Dead Stock</span>
                <span style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                  {executiveHighlights.cashTrappedInDeadStock.productCount} Products
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                <CurrencyDisplay value={executiveHighlights.cashTrappedInDeadStock.totalValue} />
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Capital idle on shelves. Liquidate via flash discounts or bundles.
              </div>
            </div>

            {/* 3. Imminent Stockouts */}
            <div className="card" style={{ padding: 18, borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Stockout Warnings</span>
                <span style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                  {executiveHighlights.criticalStockoutAlerts.count} Critical Items
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                <CurrencyDisplay value={executiveHighlights.criticalStockoutAlerts.potentialLostRevenue} />
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Estimated revenue at risk if inventory runs dry. Reorder immediately.
              </div>
            </div>

            {/* 4. Overhead Expense Burden */}
            <div className="card" style={{ padding: 18, borderLeft: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Expense vs Gross Profit</span>
                <span
                  style={{
                    background:
                      executiveHighlights.operatingExpenseRatio.status === 'OPTIMAL'
                        ? 'rgba(16,185,129,0.12)'
                        : 'rgba(239,68,68,0.12)',
                    color:
                      executiveHighlights.operatingExpenseRatio.status === 'OPTIMAL' ? '#10b981' : '#ef4444',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {executiveHighlights.operatingExpenseRatio.ratioPct}% Load
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                <CurrencyDisplay value={executiveHighlights.operatingExpenseRatio.totalExpenses} />
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Status: <strong>{executiveHighlights.operatingExpenseRatio.status}</strong> overhead load.
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* NAVIGATION TABS: EXECUTIVE SEGMENTED CARD DECK                           */}
          {/* ========================================================================= */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: 8,
              marginBottom: 24,
              boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 8,
              }}
            >
              {[
                {
                  id: 'overview',
                  title: 'Strategic Pulse',
                  subLabel: '30 & 90-Day Forecast',
                  icon: Activity,
                  badge: 'Pulse',
                  badgeColor: 'blue',
                },
                {
                  id: 'restock',
                  title: 'Restock & Buy Guide',
                  subLabel: 'Reorder ROI & Runway',
                  icon: PackagePlus,
                  badge: restockGuide.summary.criticalCount > 0 ? `${restockGuide.summary.criticalCount} Urgent` : 'Healthy',
                  badgeColor: restockGuide.summary.criticalCount > 0 ? 'red' : 'green',
                },
                {
                  id: 'pricing',
                  title: 'Pricing Strategy',
                  subLabel: 'Margin Levers & Bumps',
                  icon: Percent,
                  badge: pricingOptimizer.summary.underpricedCount > 0 ? `${pricingOptimizer.summary.underpricedCount} Adjust` : 'Optimal',
                  badgeColor: pricingOptimizer.summary.underpricedCount > 0 ? 'amber' : 'green',
                },
                {
                  id: 'bcg',
                  title: 'BCG Product Matrix',
                  subLabel: 'Stars, Cows & Dead Stock',
                  icon: Layers,
                  badge: '4 Quadrants',
                  badgeColor: 'purple',
                },
                {
                  id: 'simulator',
                  title: 'Scaling Simulator',
                  subLabel: 'Interactive Profit Model',
                  icon: Sliders,
                  badge: 'What-If AI',
                  badgeColor: 'indigo',
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      border: isActive ? '1px solid #3730a3' : '1px solid #e2e8f0',
                      background: isActive
                        ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                        : '#f8fafc',
                      borderRadius: 12,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isActive ? '0 6px 16px -2px rgba(79, 70, 229, 0.3)' : 'none',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: isActive ? 'rgba(255, 255, 255, 0.18)' : '#ffffff',
                          color: isActive ? '#ffffff' : '#4f46e5',
                          border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0',
                          boxShadow: isActive ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        <Icon size={18} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: isActive ? '#ffffff' : '#1e293b',
                            lineHeight: 1.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {tab.title}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: isActive ? '#c7d2fe' : '#64748b',
                            marginTop: 2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {tab.subLabel}
                        </div>
                      </div>
                    </div>

                    {tab.badge && (
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: 8,
                          letterSpacing: '0.2px',
                          background: isActive
                            ? 'rgba(255, 255, 255, 0.22)'
                            : tab.badgeColor === 'red'
                            ? '#fee2e2'
                            : tab.badgeColor === 'amber'
                            ? '#fef3c7'
                            : tab.badgeColor === 'green'
                            ? '#dcfce7'
                            : '#e0e7ff',
                          color: isActive
                            ? '#ffffff'
                            : tab.badgeColor === 'red'
                            ? '#b91c1c'
                            : tab.badgeColor === 'amber'
                            ? '#b45309'
                            : tab.badgeColor === 'green'
                            ? '#15803d'
                            : '#4338ca',
                          boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: STRATEGIC OVERVIEW & FUTURE RUNWAY FORECAST                        */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gap: 24 }}>
              {/* Predictive Financial Projections (30 & 90 Days) */}
              <section className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>Predictive Financial Run-Rate Projections</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>
                      Linear trend projection extrapolated from {futureProjections.historicalDays} days of verified sales and expense velocity.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      Daily Pace: <strong><CurrencyDisplay value={futureProjections.dailyAvgRevenue} />/day</strong>
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      Daily Net: <strong style={{ color: futureProjections.dailyAvgProfit >= 0 ? '#10b981' : '#ef4444' }}>
                        <CurrencyDisplay value={futureProjections.dailyAvgProfit} />/day
                      </strong>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {/* Next 30 Days Forecast */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: 12,
                      padding: 18,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Next 30 Days Forecast</span>
                      <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                        Short-Term
                      </span>
                    </div>

                    <div style={{ display: 'grid', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#64748b' }}>Projected Revenue:</span>
                        <strong><CurrencyDisplay value={futureProjections.forecast30Days.projectedRevenue} /></strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#64748b' }}>Projected Cost of Goods:</span>
                        <span><CurrencyDisplay value={futureProjections.forecast30Days.projectedCogs} /></span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#64748b' }}>Projected Expenses:</span>
                        <span><CurrencyDisplay value={futureProjections.forecast30Days.projectedExpenses} /></span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 14,
                          paddingTop: 10,
                          borderTop: '1px solid #cbd5e1',
                          fontWeight: 700,
                        }}
                      >
                        <span style={{ color: '#1e293b' }}>Projected Net Profit:</span>
                        <span style={{ color: futureProjections.forecast30Days.projectedNetProfit >= 0 ? '#10b981' : '#ef4444' }}>
                          <CurrencyDisplay value={futureProjections.forecast30Days.projectedNetProfit} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next 90 Days Forecast */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: 12,
                      padding: 18,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Next 90 Days (Quarterly)</span>
                      <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                        Quarter Run-Rate
                      </span>
                    </div>

                    <div style={{ display: 'grid', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#64748b' }}>Projected Revenue:</span>
                        <strong><CurrencyDisplay value={futureProjections.forecast90Days.projectedRevenue} /></strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#64748b' }}>Projected Cost of Goods:</span>
                        <span><CurrencyDisplay value={futureProjections.forecast90Days.projectedCogs} /></span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#64748b' }}>Projected Expenses:</span>
                        <span><CurrencyDisplay value={futureProjections.forecast90Days.projectedExpenses} /></span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 14,
                          paddingTop: 10,
                          borderTop: '1px solid #cbd5e1',
                          fontWeight: 700,
                        }}
                      >
                        <span style={{ color: '#1e293b' }}>Projected Net Profit:</span>
                        <span style={{ color: futureProjections.forecast90Days.projectedNetProfit >= 0 ? '#10b981' : '#ef4444' }}>
                          <CurrencyDisplay value={futureProjections.forecast90Days.projectedNetProfit} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Working Capital & Receivables Management */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {/* Overdue Debtors Strategy */}
                <section className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, color: '#1e293b' }}>Credit Control & Debt Recovery</h3>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                        Customer receivables restricted working capital.
                      </p>
                    </div>
                    <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                      Total Due: <CurrencyDisplay value={profitLevers.debtCollectionStrategy.totalCustomerDue} />
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#475569', background: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 12, border: '1px solid #e2e8f0' }}>
                    💡 <strong>Owner Action:</strong> {profitLevers.debtCollectionStrategy.actionGuide}
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    {profitLevers.debtCollectionStrategy.highRiskDebtors.slice(0, 5).map((debtor: any) => (
                      <div
                        key={debtor.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #edf2f7',
                          background: '#ffffff',
                        }}
                      >
                        <div>
                          <Link href={`/dashboard/customers/${debtor.id}`} style={{ fontWeight: 600, fontSize: 13, color: '#4f46e5' }}>
                            {debtor.name}
                          </Link>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>
                            {debtor.phone ? `📞 ${debtor.phone}` : 'No phone'} {debtor.lastSaleDate ? `• Last: ${debtor.lastSaleDate}` : ''}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: '#ef4444', fontSize: 13 }}>
                            <CurrencyDisplay value={debtor.balance} />
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Operating Expense Audit */}
                <section className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, color: '#1e293b' }}>Operating Expense Burden Audit</h3>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                        Overhead distribution and expense leak detection.
                      </p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                      Total: <strong><CurrencyDisplay value={executiveHighlights.operatingExpenseRatio.totalExpenses} /></strong>
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#475569', background: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 12, border: '1px solid #e2e8f0' }}>
                    💡 <strong>Owner Recommendation:</strong> {profitLevers.expenseOptimization.recommendation}
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    {profitLevers.expenseOptimization.topExpenseCategories.map((exp: any, i: number) => (
                      <div key={i} style={{ display: 'grid', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{exp.category}</span>
                          <span>
                            <strong><CurrencyDisplay value={exp.amount} /></strong> ({exp.pctOfTotal}%)
                          </span>
                        </div>
                        <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${exp.pctOfTotal}%`, height: '100%', background: '#6366f1' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SMART RESTOCK & BUY GUIDE ("WHAT SHOULD HE BUY?")                  */}
          {/* ========================================================================= */}
          {activeTab === 'restock' && (
            <div style={{ display: 'grid', gap: 20 }}>
              {/* Procurement Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div className="card" style={{ padding: 16 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Critical Stockouts / Urgent</span>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444', margin: '4px 0' }}>
                    {restockGuide.summary.criticalCount}
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Risk of lost orders</span>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Low Stock Buffer</span>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>
                    {restockGuide.summary.lowCount}
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Reorder within 14 days</span>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Required Capital Needed</span>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5', margin: '4px 0' }}>
                    <CurrencyDisplay value={restockGuide.summary.totalCapitalNeeded} />
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>To fund recommended stock</span>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Projected Profit Return</span>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981', margin: '4px 0' }}>
                    <CurrencyDisplay value={restockGuide.summary.projectedProfitReturn} />
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Expected gross earnings</span>
                </div>
              </div>

              {/* Filter Buttons & Export */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { id: 'ALL', label: `All Recommendations (${restockGuide.recommendations.length})` },
                      { id: 'CRITICAL', label: `🚨 Urgent Stockout (${restockGuide.summary.criticalCount})` },
                      { id: 'LOW', label: `⚠️ Low Stock (${restockGuide.summary.lowCount})` },
                      { id: 'OVERSTOCKED', label: `📦 Overstocked (${restockGuide.summary.overstockedCount})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setRestockFilter(f.id as any)}
                        style={{
                          border: restockFilter === f.id ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                          background: restockFilter === f.id ? '#eef2ff' : '#ffffff',
                          color: restockFilter === f.id ? '#4f46e5' : '#64748b',
                          fontWeight: restockFilter === f.id ? 700 : 500,
                          fontSize: 12,
                          padding: '6px 12px',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <ExportMenu
                    filename="StockPilot_Restock_Intelligence_Guide"
                    columns={[
                      { header: 'Product', key: 'name' },
                      { header: 'SKU', key: 'sku' },
                      { header: 'Category', key: 'category' },
                      { header: 'Current Stock', key: 'currentStock' },
                      { header: 'Runway Days', key: 'runwayDays' },
                      { header: 'Status', key: 'status' },
                      { header: 'Suggested Reorder Qty', key: 'suggestedReorderQty' },
                      { header: 'Estimated Investment', key: 'estimatedCost' },
                      { header: 'Projected Revenue', key: 'projectedRevenue' },
                      { header: 'Projected Profit', key: 'projectedProfit' },
                      { header: 'Supplier', key: 'supplierName' },
                    ]}
                    data={filteredRestock}
                  />
                </div>

                {filteredRestock.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                    <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ color: '#334155', margin: 0 }}>No inventory alerts in this category</h4>
                    <p style={{ fontSize: 13, margin: '4px 0 0' }}>All catalog stocks are operating within target buffers.</p>
                  </div>
                ) : (
                  <DataTable
                    columns={[
                      'Product & SKU',
                      'Stock Runway',
                      'Daily Pace',
                      'Suggested Reorder',
                      'Investment Cost',
                      'Projected Profit / ROI',
                      'Action & Supplier',
                    ]}
                  >
                    {filteredRestock.map((item: any) => {
                      const isCritical = item.status === 'CRITICAL';
                      const isLow = item.status === 'LOW';
                      const isOverstocked = item.status === 'OVERSTOCKED';

                      return (
                        <tr key={item.id} style={{ background: isCritical ? '#fff8f8' : undefined }}>
                          <td>
                            <div>
                              <Link href={`/dashboard/products/${item.id}`} style={{ fontWeight: 700, color: '#1e293b' }}>
                                {item.name}
                              </Link>
                              <div style={{ fontSize: 11, color: '#64748b' }}>
                                <code>{item.sku}</code> • {item.category}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div>
                              <span
                                style={{
                                  background: isCritical ? '#fee2e2' : isLow ? '#fef3c7' : isOverstocked ? '#e0f2fe' : '#dcfce7',
                                  color: isCritical ? '#b91c1c' : isLow ? '#b45309' : isOverstocked ? '#0369a1' : '#15803d',
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 800,
                                }}
                              >
                                {isCritical
                                  ? '🚨 CRITICAL'
                                  : isLow
                                  ? '⚠️ LOW'
                                  : isOverstocked
                                  ? '📦 OVERSTOCKED'
                                  : 'HEALTHY'}
                              </span>
                              <div style={{ fontSize: 11.5, color: '#475569', marginTop: 4 }}>
                                <strong>{item.currentStock} in stock</strong>
                                {item.runwayDays !== 999 && ` (~${item.runwayDays} days left)`}
                              </div>
                            </div>
                          </td>

                          <td>
                            <strong style={{ fontSize: 13, color: '#1e293b' }}>{item.dailyRunRate} units/day</strong>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Safety Min: {item.minimumStock}</div>
                          </td>

                          <td>
                            <strong style={{ fontSize: 14, color: '#4f46e5' }}>+{item.suggestedReorderQty} units</strong>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              @ <CurrencyDisplay value={item.unitCost} /> unit cost
                            </div>
                          </td>

                          <td>
                            <strong style={{ fontSize: 13, color: '#334155' }}>
                              <CurrencyDisplay value={item.estimatedCost} />
                            </strong>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Capital needed</div>
                          </td>

                          <td>
                            <strong style={{ color: '#10b981', fontSize: 13 }}>
                              +<CurrencyDisplay value={item.projectedProfit} />
                            </strong>
                            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                              {item.roiPct}% gross ROI
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <Link
                                href={`/dashboard/purchases/create?productId=${item.id}&quantity=${item.suggestedReorderQty}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 4,
                                  background: isCritical ? '#ef4444' : '#4f46e5',
                                  color: '#ffffff',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: '5px 9px',
                                  borderRadius: 6,
                                  textDecoration: 'none',
                                }}
                              >
                                <PackagePlus size={12} />
                                + Order Now
                              </Link>
                              <span style={{ fontSize: 10.5, color: '#64748b' }}>
                                {item.supplierName ? `Supplier: ${item.supplierName}` : 'No designated vendor'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </DataTable>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PRICING STRATEGY & MARGIN OPTIMIZER                                */}
          {/* ========================================================================= */}
          {activeTab === 'pricing' && (
            <div style={{ display: 'grid', gap: 20 }}>
              {/* Pricing Advisor Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  borderRadius: 14,
                  padding: 20,
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    Algorithmic Price Advisor
                  </span>
                  <h3 style={{ margin: '8px 0 4px', fontSize: 18, color: '#ffffff' }}>
                    Estimated Profit Yield: +<CurrencyDisplay value={pricingOptimizer.summary.potentialMonthlyProfitBoost} /> / month
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#e0e7ff', maxWidth: 620 }}>
                    Adjusting low-margin products to industry benchmark margins and capturing subtle 5% price premiums on star items unlocks recurring monthly profit without overhead expansion.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{pricingOptimizer.summary.underpricedCount}</div>
                    <div style={{ fontSize: 11, color: '#e0e7ff' }}>Low-Margin Alert</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{pricingOptimizer.summary.premiumOpportunityCount}</div>
                    <div style={{ fontSize: 11, color: '#e0e7ff' }}>Premium Power</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{pricingOptimizer.summary.stalePriceCount}</div>
                    <div style={{ fontSize: 11, color: '#e0e7ff' }}>Clearance Candidates</div>
                  </div>
                </div>
              </div>

              {/* Pricing Filter Buttons & Table */}
              <section className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { id: 'ALL', label: `All Pricing Diagnoses (${pricingOptimizer.recommendations.length})` },
                      { id: 'RAISE_MARGIN', label: `Underpriced Margin <15% (${pricingOptimizer.summary.underpricedCount})` },
                      { id: 'PREMIUM_BUMP', label: `Premium Bumps +5% (${pricingOptimizer.summary.premiumOpportunityCount})` },
                      { id: 'CLEARANCE_DISCOUNT', label: `Dead Stock Clearance (${pricingOptimizer.summary.stalePriceCount})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPricingFilter(f.id as any)}
                        style={{
                          border: pricingFilter === f.id ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                          background: pricingFilter === f.id ? '#eef2ff' : '#ffffff',
                          color: pricingFilter === f.id ? '#4f46e5' : '#64748b',
                          fontWeight: pricingFilter === f.id ? 700 : 500,
                          fontSize: 12,
                          padding: '6px 12px',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <ExportMenu
                    filename="StockPilot_Pricing_Optimization_Strategy"
                    columns={[
                      { header: 'Product', key: 'name' },
                      { header: 'SKU', key: 'sku' },
                      { header: 'Category', key: 'category' },
                      { header: 'Current Cost', key: 'currentCost' },
                      { header: 'Current Price', key: 'currentSellingPrice' },
                      { header: 'Current Margin %', key: 'currentMarginPct' },
                      { header: 'Target Price', key: 'recommendedSellingPrice' },
                      { header: 'Target Margin %', key: 'recommendedMarginPct' },
                      { header: 'Monthly Profit Boost', key: 'projectedMonthlyProfitGain' },
                      { header: 'Rationale', key: 'rationale' },
                    ]}
                    data={filteredPricing}
                  />
                </div>

                {filteredPricing.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                    <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ color: '#334155', margin: 0 }}>Product pricing is well-aligned with margin benchmarks</h4>
                    <p style={{ fontSize: 13, margin: '4px 0 0' }}>No razor-thin margins or stagnant excessive markups detected.</p>
                  </div>
                ) : (
                  <DataTable
                    columns={[
                      'Product & SKU',
                      'Current Cost & Price',
                      'Current Margin',
                      'Recommended Target Price',
                      'Estimated Monthly Gain',
                      'Pricing Rationale & Action',
                    ]}
                  >
                    {filteredPricing.map((item: any) => {
                      const isRaise = item.type === 'RAISE_MARGIN';
                      const isPremium = item.type === 'PREMIUM_BUMP';
                      const isClearance = item.type === 'CLEARANCE_DISCOUNT';

                      return (
                        <tr key={item.id}>
                          <td>
                            <div>
                              <Link href={`/dashboard/products/${item.id}`} style={{ fontWeight: 700, color: '#1e293b' }}>
                                {item.name}
                              </Link>
                              <div style={{ fontSize: 11, color: '#64748b' }}>
                                <code>{item.sku}</code> • {item.category}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                              <CurrencyDisplay value={item.currentSellingPrice} />
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>
                              Cost: <CurrencyDisplay value={item.currentCost} />
                            </div>
                          </td>

                          <td>
                            <span
                              style={{
                                background: isRaise ? '#fee2e2' : '#f1f5f9',
                                color: isRaise ? '#ef4444' : '#334155',
                                padding: '2px 7px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {item.currentMarginPct}%
                            </span>
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong style={{ fontSize: 14, color: '#4f46e5' }}>
                                <CurrencyDisplay value={item.recommendedSellingPrice} />
                              </strong>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: item.priceAdjustment > 0 ? '#10b981' : '#ef4444',
                                }}
                              >
                                {item.priceAdjustment > 0 ? `+৳${item.priceAdjustment} (+${item.adjustmentPct}%)` : `-৳${Math.abs(item.priceAdjustment)} (${item.adjustmentPct}%)`}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              Target Margin: <strong>{item.recommendedMarginPct}%</strong>
                            </div>
                          </td>

                          <td>
                            {item.projectedMonthlyProfitGain > 0 ? (
                              <div>
                                <strong style={{ color: '#10b981', fontSize: 13 }}>
                                  +<CurrencyDisplay value={item.projectedMonthlyProfitGain} />
                                </strong>
                                <div style={{ fontSize: 10.5, color: '#64748b' }}>/ month recurring</div>
                              </div>
                            ) : (
                              <span style={{ fontSize: 11.5, color: '#d97706', fontWeight: 600 }}>Unlocks trapped cash</span>
                            )}
                          </td>

                          <td style={{ maxWidth: 320 }}>
                            <p style={{ fontSize: 11.5, color: '#475569', margin: '0 0 6px', lineHeight: 1.35 }}>
                              {item.rationale}
                            </p>
                            <Link
                              href={`/dashboard/products/${item.id}`}
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#4f46e5',
                                textDecoration: 'underline',
                              }}
                            >
                              Edit Selling Price →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </DataTable>
                )}
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BCG MATRIX CLASSIFICATION ("WHICH PRODUCTS DOING GREAT")           */}
          {/* ========================================================================= */}
          {activeTab === 'bcg' && (
            <div style={{ display: 'grid', gap: 20 }}>
              {/* 4 Quadrants Grid Header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {/* 1. Stars */}
                <div
                  onClick={() => setBcgTab('stars')}
                  style={{
                    background: bcgTab === 'stars' ? '#ecfdf5' : '#ffffff',
                    border: bcgTab === 'stars' ? '2px solid #10b981' : '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 18,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 18 }}>⭐</span>
                      <strong style={{ fontSize: 15, color: '#065f46' }}>Stars</strong>
                    </div>
                    <span style={{ background: '#10b981', color: '#ffffff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                      {bcgMatrix.stars.count} Items
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#047857', marginBottom: 8 }}>
                    High Velocity • High Margin
                  </div>
                  <div style={{ fontSize: 12, color: '#334155' }}>
                    Revenue: <strong><CurrencyDisplay value={bcgMatrix.stars.revenue} /></strong>
                    <br />
                    Profit: <strong style={{ color: '#10b981' }}><CurrencyDisplay value={bcgMatrix.stars.profit} /></strong>
                  </div>
                </div>

                {/* 2. Cash Cows */}
                <div
                  onClick={() => setBcgTab('cashCows')}
                  style={{
                    background: bcgTab === 'cashCows' ? '#eef2ff' : '#ffffff',
                    border: bcgTab === 'cashCows' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 18,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 18 }}>🐄</span>
                      <strong style={{ fontSize: 15, color: '#3730a3' }}>Cash Cows</strong>
                    </div>
                    <span style={{ background: '#4f46e5', color: '#ffffff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                      {bcgMatrix.cashCows.count} Items
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#4338ca', marginBottom: 8 }}>
                    High Velocity • Steady Margin
                  </div>
                  <div style={{ fontSize: 12, color: '#334155' }}>
                    Revenue: <strong><CurrencyDisplay value={bcgMatrix.cashCows.revenue} /></strong>
                    <br />
                    Profit: <strong style={{ color: '#4f46e5' }}><CurrencyDisplay value={bcgMatrix.cashCows.profit} /></strong>
                  </div>
                </div>

                {/* 3. Opportunities */}
                <div
                  onClick={() => setBcgTab('opportunities')}
                  style={{
                    background: bcgTab === 'opportunities' ? '#fffbeb' : '#ffffff',
                    border: bcgTab === 'opportunities' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 18,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 18 }}>🚀</span>
                      <strong style={{ fontSize: 15, color: '#92400e' }}>Opportunities</strong>
                    </div>
                    <span style={{ background: '#f59e0b', color: '#ffffff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                      {bcgMatrix.opportunities.count} Items
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#b45309', marginBottom: 8 }}>
                    Low Velocity • High Margin
                  </div>
                  <div style={{ fontSize: 12, color: '#334155' }}>
                    Revenue: <strong><CurrencyDisplay value={bcgMatrix.opportunities.revenue} /></strong>
                    <br />
                    Profit: <strong style={{ color: '#d97706' }}><CurrencyDisplay value={bcgMatrix.opportunities.profit} /></strong>
                  </div>
                </div>

                {/* 4. Dead Stock */}
                <div
                  onClick={() => setBcgTab('deadStock')}
                  style={{
                    background: bcgTab === 'deadStock' ? '#fef2f2' : '#ffffff',
                    border: bcgTab === 'deadStock' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 18,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 18 }}>💀</span>
                      <strong style={{ fontSize: 15, color: '#991b1b' }}>Dead Stock</strong>
                    </div>
                    <span style={{ background: '#ef4444', color: '#ffffff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                      {bcgMatrix.deadStock.count} Items
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#b91c1c', marginBottom: 8 }}>
                    Zero Velocity • Stagnant Capital
                  </div>
                  <div style={{ fontSize: 12, color: '#334155' }}>
                    Trapped: <strong style={{ color: '#ef4444' }}><CurrencyDisplay value={bcgMatrix.deadStock.trappedCapital} /></strong>
                  </div>
                </div>
              </div>

              {/* Active BCG Detail Table */}
              <section className="card" style={{ padding: 20 }}>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 16, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    Strategy Playbook for {bcgTab === 'stars' ? 'Stars' : bcgTab === 'cashCows' ? 'Cash Cows' : bcgTab === 'opportunities' ? 'Opportunities' : 'Dead Stock'}:
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#475569' }}>
                    {bcgMatrix[bcgTab].advice}
                  </p>
                </div>

                {bcgTab === 'deadStock' ? (
                  <DataTable columns={['Stagnant Product', 'SKU', 'Stock On Hand', 'Unit Cost', 'Trapped Capital Value', 'Recommended Action']}>
                    {bcgMatrix.deadStock.products.map((p: any) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>
                          <code>{p.sku}</code>
                        </td>
                        <td>{p.stock} units</td>
                        <td>
                          <CurrencyDisplay value={p.unitCost} />
                        </td>
                        <td>
                          <strong style={{ color: '#ef4444' }}>
                            <CurrencyDisplay value={p.trappedValue} />
                          </strong>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>
                            Clearance markdown / Flash bundle
                          </span>
                        </td>
                      </tr>
                    ))}
                  </DataTable>
                ) : (
                  <DataTable columns={['Product', 'SKU', 'Units Sold', 'Total Revenue', 'Gross Profit', 'Margin %', 'Stock Level']}>
                    {bcgMatrix[bcgTab].products.map((p: any) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>
                          <code>{p.sku}</code>
                        </td>
                        <td>
                          <strong>{p.unitsSold} units</strong>
                        </td>
                        <td>
                          <CurrencyDisplay value={p.revenue} />
                        </td>
                        <td>
                          <strong style={{ color: '#10b981' }}>
                            <CurrencyDisplay value={p.profit} />
                          </strong>
                        </td>
                        <td>
                          <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
                            {p.marginPct}%
                          </span>
                        </td>
                        <td>{p.stock} in stock</td>
                      </tr>
                    ))}
                  </DataTable>
                )}
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: SCALING ROADMAP & INTERACTIVE SIMULATOR                            */}
          {/* ========================================================================= */}
          {activeTab === 'simulator' && (
            <div style={{ display: 'grid', gap: 24 }}>
              {/* Interactive "What-If" Simulator */}
              <section
                className="card"
                style={{
                  padding: 24,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                  border: '1px solid #c7d2fe',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Sliders size={20} color="#4f46e5" />
                  <h3 style={{ margin: 0, fontSize: 17, color: '#1e293b' }}>
                    Interactive Business Growth & Profit Simulator
                  </h3>
                </div>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>
                  Adjust levers to immediately model the financial impact on your monthly net profit and unlocked working capital.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 24 }}>
                  {/* Slider 1: Price Adjustment */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>Average Price Optimization:</span>
                      <strong style={{ color: '#4f46e5' }}>+{simPriceAdjustment}%</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={simPriceAdjustment}
                      onChange={(e) => setSimPriceAdjustment(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#4f46e5' }}
                    />
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Targeted repricing across underpriced items.</div>
                  </div>

                  {/* Slider 2: Sales Volume Growth */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>Sales Volume Expansion:</span>
                      <strong style={{ color: '#10b981' }}>+{simVolumeGrowth}%</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      step={2}
                      value={simVolumeGrowth}
                      onChange={(e) => setSimVolumeGrowth(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#10b981' }}
                    />
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Through bundles, promotions & marketing.</div>
                  </div>

                  {/* Slider 3: Expense Reduction */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>Overhead Expense Rationalization:</span>
                      <strong style={{ color: '#06b6d4' }}>-{simExpenseCut}%</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={simExpenseCut}
                      onChange={(e) => setSimExpenseCut(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#06b6d4' }}
                    />
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Eliminating non-critical operational leaks.</div>
                  </div>

                  {/* Slider 4: Dead Stock Liquidation */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>Dead Stock Liquidation:</span>
                      <strong style={{ color: '#f59e0b' }}>{simDeadStockLiquidation}%</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={simDeadStockLiquidation}
                      onChange={(e) => setSimDeadStockLiquidation(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#f59e0b' }}
                    />
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Unlocking cash from non-selling goods.</div>
                  </div>
                </div>

                {/* Simulation Output Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Simulated Monthly Revenue</span>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: '4px 0' }}>
                      <CurrencyDisplay value={simulationResults.newRevenue} />
                    </div>
                    <span style={{ fontSize: 11.5, color: '#10b981', fontWeight: 700 }}>
                      Expanded top-line run-rate
                    </span>
                  </div>

                  <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>New Monthly Net Profit</span>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981', margin: '4px 0' }}>
                      <CurrencyDisplay value={simulationResults.newProfit} />
                    </div>
                    <span style={{ fontSize: 11.5, color: '#10b981', fontWeight: 700 }}>
                      +<CurrencyDisplay value={simulationResults.profitDiff} /> extra profit/mo
                    </span>
                  </div>

                  <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Trapped Cash Recovered</span>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>
                      <CurrencyDisplay value={simulationResults.unlockedCash} />
                    </div>
                    <span style={{ fontSize: 11.5, color: '#d97706', fontWeight: 600 }}>
                      Direct liquidity returned to bank
                    </span>
                  </div>

                  <div style={{ background: '#eef2ff', padding: 16, borderRadius: 10, border: '1px solid #c7d2fe' }}>
                    <span style={{ fontSize: 12, color: '#4338ca', fontWeight: 600 }}>Annualized Net Value Add</span>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#4338ca', margin: '4px 0' }}>
                      +<CurrencyDisplay value={simulationResults.annualGain} />
                    </div>
                    <span style={{ fontSize: 11, color: '#4338ca' }}>
                      Projected extra earnings/year
                    </span>
                  </div>
                </div>
              </section>

              {/* Owner Scaling Strategic Roadmap */}
              <section className="card" style={{ padding: 22 }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>
                    Owner Milestone Checklist: 5 Pillars to Scale the Business
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>
                    Follow this prioritized sequence of operational adjustments to expand capacity and profit margins.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: 14 }}>
                  {futureProjections.scalingRoadmap.map((item: any) => (
                    <div
                      key={item.step}
                      style={{
                        display: 'flex',
                        gap: 14,
                        alignItems: 'flex-start',
                        padding: '14px 16px',
                        borderRadius: 10,
                        border: '1px solid #edf2f7',
                        background: '#ffffff',
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: item.impact === 'CRITICAL' ? '#fee2e2' : item.impact === 'HIGH' ? '#eef2ff' : '#f1f5f9',
                          color: item.impact === 'CRITICAL' ? '#ef4444' : item.impact === 'HIGH' ? '#4f46e5' : '#64748b',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 800,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {item.step}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{item.title}</span>
                          <span
                            style={{
                              background: item.impact === 'CRITICAL' ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
                              color: item.impact === 'CRITICAL' ? '#ef4444' : '#4f46e5',
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {item.impact}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Product Bundling & Cross-Sell Engine */}
              <section className="card" style={{ padding: 22 }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>
                    Algorithmic Cross-Sell & Bundling Engine
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>
                    Strategic product combinations designed to accelerate slow inventory using high-velocity customer traffic.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                  {profitLevers.crossSellBundles.map((bundle: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: 16,
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#4f46e5', marginBottom: 6 }}>
                        {bundle.title}
                      </div>
                      <p style={{ fontSize: 12, color: '#334155', margin: '0 0 8px', lineHeight: 1.35 }}>
                        {bundle.description}
                      </p>
                      <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, background: '#dcfce7', padding: '6px 10px', borderRadius: 6 }}>
                        🚀 <strong>Benefit:</strong> {bundle.expectedBenefit}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
