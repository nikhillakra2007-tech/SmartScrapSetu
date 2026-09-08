"use client";
import { T, useLocale } from '@/components/language/Language';

import React, { useState, useEffect } from "react";
import AppShell from "@/components/shell/AppShell";
import CollectorPortal from "@/features/collector/CollectorPortal";
import LivePriceBoard from "@/features/price-board/LivePriceBoard";
import SafetyGuidanceView from "@/features/safety/SafetyGuidanceView";
import Pickups from "@/features/pickups/Pickups";
import {
  MOCK_MATCHED_LOTS,
  MOCK_PICKUP_REQUESTS,
  CURRENT_RECYCLER,
  MOCK_PRICE_BOARD, 
  MOCK_SAFETY_GUIDES
} from "@/lib/mock-data";
import CollectionSchedule from '@/features/collector/CollectionSchedule';
import EarningsAnalytics from '@/features/collector/EarningsAnalytics';
import { INITIAL_MOCK_PICKUPS, INITIAL_MOCK_TRANSACTIONS } from '@/lib/collector-mock-data';
import { CollectorPickup, Transaction, PickupStatus } from '@/lib/collector-types';
import { MOCK_COLLECTOR_ID } from '@/lib/collector-service';
import { LotMatch } from "@/types/database";
import {
  Package,
  CheckCircle2,
  IndianRupee,
  ShieldCheck,
  Plus,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Truck,
  X,
  ArrowRight,
  Check,
  Building2,
} from "lucide-react";
import styles from "./CollectorWorkspace.module.css";

interface MaterialOption {
  id: string;
  name: string;
  code: string;
  ratePerKg: number;
  category: string;
}

const MATERIAL_OPTIONS: MaterialOption[] = [
  {
    id: "plastic",
    name: "Plastic (PET / HDPE)",
    code: "mixed_plastic",
    ratePerKg: 28,
    category: "PLASTIC",
  },
  {
    id: "glass",
    name: "Glass Bottles & Cullet",
    code: "cullet_bottles",
    ratePerKg: 12,
    category: "GLASS",
  },
  {
    id: "paper",
    name: "Paper & Cardboard (OCC)",
    code: "corrugated_kraft",
    ratePerKg: 18,
    category: "PAPER",
  },
  {
    id: "metal_ferrous",
    name: "Metal — Ferrous (Iron & Steel)",
    code: "heavy_iron_steel",
    ratePerKg: 38,
    category: "METAL_FERROUS",
  },
  {
    id: "metal_nonferrous",
    name: "Metal — Non-Ferrous (Copper / Brass)",
    code: "copper_brass_alu",
    ratePerKg: 420,
    category: "METAL_NONFERROUS",
  },
  {
    id: "e_waste",
    name: "E-Waste & Circuit Boards",
    code: "mixed_ewaste_pcb",
    ratePerKg: 280,
    category: "E_WASTE",
  },
  {
    id: "textile",
    name: "Textile / Cloth Fabrics",
    code: "cotton_synthetic_scrap",
    ratePerKg: 16,
    category: "TEXTILE",
  },
  {
    id: "rubber_other",
    name: "Rubber & Other (Tyres)",
    code: "tyre_industrial_rubber",
    ratePerKg: 22,
    category: "RUBBER_OTHER",
  },
];

export default function CollectorWorkspace() {
 const {t:translate}=useLocale();

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email?: string;
    role?: "recycler" | "collector" | "admin";
  } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("collector-scan");
  const [matchedLots, setMatchedLots] = useState<LotMatch[]>(MOCK_MATCHED_LOTS);

  // PRD States
  const [pickups, setPickups] = useState<CollectorPickup[]>(INITIAL_MOCK_PICKUPS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_MOCK_TRANSACTIONS);

  // Helper for generating deterministic IDs in mock
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleUpdatePickup = (id: string, status: PickupStatus) => {
    setPickups(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleCompletePickup = (pickupId: string, actualWeight: number) => {
    const pickup = pickups.find(p => p.id === pickupId);
    if (!pickup) return;

    setPickups(prev => prev.map(p => p.id === pickupId ? { ...p, status: 'COMPLETED' } : p));

    const expectedWeight = pickup.estimated_quantity_kg || 1;
    const avgExpectedValue = (pickup.estimated_value_min + pickup.estimated_value_max) / 2;
    const valuePerKg = avgExpectedValue / expectedWeight;
    const actualValue = valuePerKg * actualWeight;

    const newTx: Transaction = {
      id: `tx-${generateId()}`,
      pickup_id: pickup.id,
      collector_id: MOCK_COLLECTOR_ID,
      actual_quantity_kg: actualWeight,
      actual_value: actualValue,
      transaction_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      items: [
        {
          id: `item-${generateId()}`,
          material_category: pickup.expected_material,
          quantity_kg: actualWeight,
          value: actualValue,
        }
      ]
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // Workable Create Lot Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(
    MATERIAL_OPTIONS[0],
  );
  const [lotWeight, setLotWeight] = useState<number>(25);
  const [lotCluster, setLotCluster] = useState<string>("Okhla Industrial Area");
  const [creationSuccessNotice, setCreationSuccessNotice] = useState<
    string | null
  >(null);

  // Authentication gate & role verification
  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("scrapsetu_auth_user")
          : null;

      if (!stored) {
        window.location.href = "/auth";
        return;
      }

      const user = JSON.parse(stored);
      if (user.role === "recycler") {
        window.location.href = "/recycler";
        return;
      }
      if (user.role === "admin") {
        window.location.href = "/admin";
        return;
      }

      setCurrentUser(user);
    } catch (e) {
      window.location.href = "/auth";
      return;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // Lock background body scroll and prevent wheel leakage when modal is open
  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCreateModalOpen]);

  const handleSignOut = () => {
    try {
      localStorage.removeItem("scrapsetu_auth_user");
    } catch (e) {}
    window.location.href = "/auth";
  };

  const handleLotCreated = (newMatch: LotMatch) => {
    setMatchedLots((prev) => [newMatch, ...prev]);
  };

  // Workable Create Lot Submission
  const handleConfirmCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    const newLotId = `LOT-DEL-${Math.floor(100 + Math.random() * 900)}`;
    const estimatedValue = Math.round(lotWeight * selectedMaterial.ratePerKg);

    const newMatch: LotMatch = {
      id: `match-${Date.now()}`,
      lot_id: newLotId,
      recycler_id: CURRENT_RECYCLER.id,
      score: 95.0,
      rank: 1,
      status: "offered",
      offered_at: "Just now",
      lot: {
        id: newLotId,
        collector_id: "c0000000-0000-0000-0000-000000000001",
        collector_name: currentUser?.name || "Ramesh Kumar",
        parent_code: selectedMaterial.category,
        sub_code: selectedMaterial.code,
        condition: "scrap",
        weight_kg: lotWeight,
        hazard_flags: selectedMaterial.id === "battery" ? ["fire_hazard"] : [],
        ai_suggested_rate_per_kg: selectedMaterial.ratePerKg,
        ai_confidence: 0.98,
        estimated_value: estimatedValue,
        ward_name: lotCluster,
        status: "matched",
        client_created_at: "Just now",
      },
    };

    setMatchedLots((prev) => [newMatch, ...prev]);
    setIsCreateModalOpen(false);
    setCreationSuccessNotice(
      `Successfully created ${newLotId} (${lotWeight}kg ${selectedMaterial.name})! Matched with EcoRecycle Scientific Hub.`,
    );
    setActiveTab("collector-scan");

    setTimeout(() => {
      setCreationSuccessNotice(null);
    }, 6000);
  };

  if (isAuthLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-app, #F6F8F5)",
          fontFamily: "var(--font-sans, sans-serif)",
          color: "var(--text-primary, #0B1220)",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            border: "3px solid var(--border-subtle, #DCE5E0)",
            borderTopColor: "var(--brand-primary, #087F5B)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            marginBottom: "1rem",
          }}
        />
        <span
          style={{
            fontSize: "0.9rem",
            color: "var(--text-secondary, #52606D)",
            fontWeight: 600,
          }}
        ><T>
          Verifying Collector credentials...
        </T></span>
      </div>
    );
  }

  const calculatedPayout = Math.round(lotWeight * selectedMaterial.ratePerKg);

  return (
    <AppShell
      role="collector"
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      currentUser={currentUser}
      onSignOut={handleSignOut}
      matchedCount={matchedLots.length}
      pickupCount={MOCK_PICKUP_REQUESTS.length}
    >
      <div className={styles.collectorContainer}>
        {/* Operational Header Banner */}
        <div className={styles.opHeader}>
          <div className={styles.opHeaderMain}>
            <div className={styles.opTitleRow}>
              <h1 className={styles.opTitle}><T>Collector Operations</T></h1>
              <span className={styles.opStatusPill}>
                <CheckCircle2 size={13} />
                <span><T>Field Active</T></span>
              </span>
            </div>
            <p className={styles.opSubtitle}><T>
              Manage your materials, estimates, and recycler handovers.
            </T></p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.createLotBtn}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={16} />
              <span><T>Create New Lot</T></span>
            </button>
          </div>
        </div>

        {/* Success Alert Toast */}
        <T>{creationSuccessNotice && (
          <div
            style={{
              padding: "0.85rem 1.25rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--brand-tint)",
              border: "1px solid var(--brand-soft)",
              color: "var(--brand-primary)",
              fontSize: "0.875rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <CheckCircle2 size={18} />
            <span><T>{creationSuccessNotice}</T></span>
          </div>
        )}</T>

        {/* 4 Concise Operational Metrics */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}><T>Active Lots</T></span>
              <div className={styles.metricIconWrap}>
                <Package size={16} />
              </div>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                <T>{matchedLots.length}</T><T> Lots
              </T></span>
              <span className={styles.metricSubtext}><T>in current queue</T></span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}><T>Ready for Handover</T></span>
              <div className={styles.metricIconWrap}>
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                <T>{matchedLots.filter((m) => m.status === "accepted").length}</T>
              </span>
              <span className={styles.metricSubtext}><T>Lots ready</T></span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}><T>
                Month&apos;s Settlement
              </T></span>
              <div className={styles.metricIconWrap}>
                <IndianRupee size={16} />
              </div>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}><T>₹24,850</T></span>
              <span className={styles.metricSubtext}><T>100% verified</T></span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}><T>Verified Lots</T></span>
              <div className={styles.metricIconWrap}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}><T>18 Lots</T></span>
              <span className={styles.metricSubtext}><T>lifetime audited</T></span>
            </div>
          </div>
        </div>

        {/* Clean Active Feature Subview Surface */}
        <div className={styles.activeViewSurface} key={activeTab}>
          <T>{activeTab === "collector-scan" && (
            <CollectorPortal
              onLotCreated={handleLotCreated}
              onNavigateToRecyclerQueue={() => {}}
            />
          )}</T>
          <T>{activeTab === "price-board" && <LivePriceBoard />}</T>
          <T>{activeTab === "safety-guidance" && <SafetyGuidanceView />}</T>
          <T>{activeTab === "customer-pickup" && <Pickups collector />}</T>
          <T>{activeTab === 'schedule' && (
            <CollectionSchedule 
              pickups={pickups} 
              onUpdatePickup={handleUpdatePickup}
              onCompletePickup={handleCompletePickup}
            />
          )}</T>
          <T>{activeTab === 'earnings' && (
            <EarningsAnalytics transactions={transactions} />
          )}</T>
        </div>
      </div>

      {/* Workable Create Lot Interactive Modal */}
      <T>{isCreateModalOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          data-lenis-prevent="true"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className={styles.modalCard}
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <h2 className={styles.modalTitle}><T>Create New Scrap Lot</T></h2>
                <p className={styles.modalSubtitle}><T>
                  Intake verified material and generate immediate facility match
                  manifest
                </T></p>
              </div>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setIsCreateModalOpen(false)}
                aria-label={translate("Close modal")}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleConfirmCreateLot}
              className={styles.modalForm}
            >
              <div
                className={styles.modalBody}
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
              >
                {/* Material Selection */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}><T>
                    Select Scrap Material Category
                  </T></label>
                  <div className={styles.materialPillsGrid}>
                    <T>{MATERIAL_OPTIONS.map((mat) => {
                      const isSelected = selectedMaterial.id === mat.id;
                      return (
                        <button
                          key={mat.id}
                          type="button"
                          className={`${styles.materialSelectBtn} ${isSelected ? styles.materialSelectBtnActive : ""}`}
                          onClick={() => setSelectedMaterial(mat)}
                        >
                          <div className={styles.matBtnText}>
                            <span className={styles.matName}><T>{mat.name}</T></span>
                            <span className={styles.matRate}><T>
                              Benchmark: ₹</T><T>{mat.ratePerKg}</T><T>/kg
                            </T></span>
                          </div>
                          <T>{isSelected && (
                            <Check size={16} color="var(--brand-primary)" />
                          )}</T>
                        </button>
                      );
                    })}</T>
                  </div>
                </div>

                {/* Net Weight */}
                <div className={styles.formGroup}>
                  <label
                    htmlFor="lot-weight-input"
                    className={styles.formLabel}
                  ><T>
                    Net Weight (Certified Tare)
                  </T></label>
                  <div className={styles.weightInputRow}>
                    <div className={styles.weightInputWrap}>
                      <input
                        id="lot-weight-input"
                        type="number"
                        min="1"
                        max="5000"
                        step="0.5"
                        className={styles.weightInput}
                        value={lotWeight}
                        onChange={(e) =>
                          setLotWeight(parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                      <span className={styles.weightUnit}><T>KG</T></span>
                    </div>

                    <div className={styles.weightPresets}>
                      <T>{[10, 25, 45, 100].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className={styles.presetBtn}
                          onClick={() => setLotWeight(preset)}
                        >
                          <T>{preset}</T><T>kg
                        </T></button>
                      ))}</T>
                    </div>
                  </div>
                </div>

                {/* Location Cluster */}
                <div className={styles.formGroup}>
                  <label
                    htmlFor="lot-cluster-select"
                    className={styles.formLabel}
                  ><T>
                    Industrial Intake Cluster
                  </T></label>
                  <select
                    id="lot-cluster-select"
                    className={styles.weightInput}
                    value={lotCluster}
                    onChange={(e) => setLotCluster(e.target.value)}
                  >
                    <option value="Okhla Industrial Area"><T>
                      Okhla Industrial Area, Phase III (South Delhi)
                    </T></option>
                    <option value="Mayapuri Scrap Market"><T>
                      Mayapuri Metal Cluster (West Delhi)
                    </T></option>
                    <option value="Bawana Industrial Zone"><T>
                      Bawana Non-Ferrous Zone (North Delhi)
                    </T></option>
                    <option value="Narela Industrial Estate"><T>
                      Narela Aggregation Hub (North Delhi)
                    </T></option>
                  </select>
                </div>

                {/* AI Valuation Live Preview */}
                <div className={styles.valuationPreviewCard}>
                  <div className={styles.valLeft}>
                    <span className={styles.valHeading}><T>
                      AI ESTIMATED GATE PAYOUT
                    </T></span>
                    <span className={styles.valFacility}><T>
                      EcoRecycle Scientific Hub · 3.4 km
                    </T></span>
                  </div>
                  <div className={styles.valRight}>
                    <span className={styles.valAmount}><T>
                      ₹</T><T>{calculatedPayout.toLocaleString()}</T>
                    </span>
                    <span className={styles.valRateSub}>
                      <T>{lotWeight}</T><T> kg × ₹</T><T>{selectedMaterial.ratePerKg}</T><T>/kg
                    </T></span>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsCreateModalOpen(false)}
                ><T>
                  Cancel
                </T></button>
                <button type="submit" className={styles.submitLotBtn}>
                  <span><T>Submit Lot & Generate Manifest</T></span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}</T>
    </AppShell>
  );
}
