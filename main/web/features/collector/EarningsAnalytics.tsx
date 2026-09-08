import React, { useState } from 'react';
import { T } from '@/components/language/Language';
import { Sparkles, ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from 'lucide-react';
import styles from './EarningsAnalytics.module.css';
import { Transaction } from '@/lib/collector-types';
import { calculateEarnings } from '@/lib/collector-service';

interface EarningsAnalyticsProps {
  transactions: Transaction[];
}

export default function EarningsAnalytics({ transactions }: EarningsAnalyticsProps) {
  const [period, setPeriod] = useState<'month'>('month'); // MVP default

  const {
    thisMonthTotal,
    thisMonthQuantity,
    thisMonthCount,
    avgTxValue,
    momGrowth,
    momQuantityGrowth,
    materialsArray,
    isFirstMonth,
  } = calculateEarnings(transactions);

  const getInsightSentence = () => {
    if (isFirstMonth || transactions.length === 0) {
      return "Welcome! Complete your first pickups to start generating insights about your business.";
    }
    const topMaterial = materialsArray.length > 0 ? materialsArray[0].category : "mixed scrap";
    if (momGrowth && momGrowth > 0) {
      return `Your earnings increased by ${momGrowth.toFixed(1)}% this month, mainly because you collected more ${topMaterial}.`;
    } else if (momGrowth && momGrowth < 0) {
      return `Your earnings are slightly down this month. Focus on high-value ${topMaterial} to boost your daily average.`;
    }
    return `You're maintaining a steady pace. Keep collecting ${topMaterial} to maximize your profit.`;
  };

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.headlineBox}>
        <span className={styles.headlineLabel}><T>This Month's Earnings</T></span>
        <span className={styles.headlineValue}><T>₹{thisMonthTotal.toLocaleString()}</T></span>
        
        {!isFirstMonth && momGrowth !== null && (
          <div className={`${styles.comparisonLine} ${momGrowth > 0 ? styles.positive : momGrowth < 0 ? styles.negative : styles.neutral}`}>
            {momGrowth > 0 ? <ArrowUpRight size={18} /> : momGrowth < 0 ? <ArrowDownRight size={18} /> : <Minus size={18} />}
            <span><T>{Math.abs(momGrowth).toFixed(1)}% {momGrowth > 0 ? 'more' : 'less'} than last month</T></span>
          </div>
        )}
        {isFirstMonth && thisMonthTotal > 0 && (
          <div className={`${styles.comparisonLine} ${styles.neutral}`}>
            <span><T>First month — comparisons will appear next month.</T></span>
          </div>
        )}
      </div>

      <div className={styles.aiInsight}>
        <Sparkles size={20} className={styles.aiIcon} />
        <p className={styles.aiText}><T>{getInsightSentence()}</T></p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}><T>Total Weight</T></span>
          <span className={styles.statValue}><T>{thisMonthQuantity.toFixed(1)} kg</T></span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}><T>Completed Pickups</T></span>
          <span className={styles.statValue}><T>{thisMonthCount}</T></span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}><T>Avg. per Pickup</T></span>
          <span className={styles.statValue}><T>₹{avgTxValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</T></span>
        </div>
      </div>

      <div className={styles.materialsSection}>
        <h3 className={styles.sectionTitle}><T>Top Earning Materials</T></h3>
        <div className={styles.materialList}>
          {materialsArray.length > 0 ? (
            materialsArray.map((mat) => (
              <div key={mat.category} className={styles.materialRow}>
                <div>
                  <div className={styles.matName}><T>{mat.category}</T></div>
                  <div className={styles.matQty}><T>{mat.quantity.toFixed(1)} kg</T></div>
                </div>
                <div className={styles.matVal}><T>₹{mat.value.toLocaleString()}</T></div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <T>No materials collected this month yet.</T>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
