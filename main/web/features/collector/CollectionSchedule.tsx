import React, { useState } from 'react';
import { T } from '@/components/language/Language';
import { MapPin, Phone, User, Clock, Check, X, Truck, Calendar } from 'lucide-react';
import styles from './CollectionSchedule.module.css';
import { CollectorPickup, Transaction, PickupStatus } from '@/lib/collector-types';
import { MOCK_COLLECTOR_ID } from '@/lib/collector-service';

interface CollectionScheduleProps {
  pickups: CollectorPickup[];
  onUpdatePickup: (id: string, status: PickupStatus, extraData?: any) => void;
  onCompletePickup: (pickupId: string, actualWeight: number) => void;
}

export default function CollectionSchedule({ pickups, onUpdatePickup, onCompletePickup }: CollectionScheduleProps) {
  const [activeView, setActiveView] = useState<'today' | 'upcoming' | 'completed'>('today');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const todayPickups = pickups.filter(p => {
    if (p.status === 'COMPLETED' || p.status === 'CANCELLED' || p.status === 'REJECTED' || p.status === 'MISSED') return false;
    const dateToCheck = p.scheduled_time || p.requested_time;
    return dateToCheck.startsWith(todayStr);
  }).sort((a, b) => new Date(a.scheduled_time || a.requested_time).getTime() - new Date(b.scheduled_time || b.requested_time).getTime());

  const upcomingPickups = pickups.filter(p => {
    if (p.status === 'COMPLETED' || p.status === 'CANCELLED' || p.status === 'REJECTED' || p.status === 'MISSED') return false;
    const dateToCheck = p.scheduled_time || p.requested_time;
    return dateToCheck > todayStr && !dateToCheck.startsWith(todayStr);
  }).sort((a, b) => new Date(a.scheduled_time || a.requested_time).getTime() - new Date(b.scheduled_time || b.requested_time).getTime());

  const completedPickups = pickups.filter(p => p.status === 'COMPLETED')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalExpectedEarnings = todayPickups.reduce((acc, p) => acc + (p.estimated_value_min + p.estimated_value_max) / 2, 0);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderPickupCard = (pickup: CollectorPickup) => (
    <div key={pickup.id} className={styles.pickupCard}>
      <div className={styles.cardHeader}>
        <div className={styles.timeBlock}>
          <span className={styles.timeText}><T>{formatTime(pickup.scheduled_time || pickup.requested_time)}</T></span>
          <span className={styles.dateText}><T>{formatDate(pickup.scheduled_time || pickup.requested_time)}</T></span>
        </div>
        <span className={`${styles.statusBadge} ${styles[`status_${pickup.status}`]}`}>
          <T>{pickup.status}</T>
        </span>
      </div>

      <div className={styles.customerInfo}>
        <span className={styles.customerName}><User size={14}/> <T>{pickup.customer_name}</T></span>
        <span className={styles.addressText}><MapPin size={14} style={{marginTop: '2px', flexShrink: 0}}/> <T>{pickup.pickup_address}</T></span>
        <span className={styles.addressText}><Phone size={14}/> <T>{pickup.customer_phone}</T></span>
      </div>

      <div className={styles.materialInfo}>
        <div>
          <div className={styles.materialName}><T>{pickup.expected_material}</T></div>
          <div className={styles.materialEst}><T>~{pickup.estimated_quantity_kg} kg</T></div>
        </div>
        <div className={styles.estValue}>
          <T>₹{pickup.estimated_value_min} - ₹{pickup.estimated_value_max}</T>
        </div>
      </div>

      <div className={styles.actions}>
        {pickup.status === 'REQUESTED' && (
          <>
            <button className={styles.btnSecondary} onClick={() => onUpdatePickup(pickup.id, 'REJECTED')}><T>Reject</T></button>
            <button className={styles.btnPrimary} onClick={() => onUpdatePickup(pickup.id, 'SCHEDULED')}><T>Accept</T></button>
          </>
        )}
        {pickup.status === 'SCHEDULED' && (
          <>
            <button className={styles.btnSecondary} onClick={() => onUpdatePickup(pickup.id, 'CANCELLED')}><T>Cancel</T></button>
            <button className={styles.btnPrimary} onClick={() => onUpdatePickup(pickup.id, 'IN_PROGRESS')}><T>Start Pickup</T></button>
          </>
        )}
        {pickup.status === 'IN_PROGRESS' && (
          <>
            <button className={styles.btnSecondary} onClick={() => onUpdatePickup(pickup.id, 'CANCELLED')}><T>Cancel</T></button>
            <button className={styles.btnPrimary} onClick={() => {
              const weight = prompt(`Enter actual weight in kg for ${pickup.expected_material}:`, pickup.estimated_quantity_kg.toString());
              if (weight && !isNaN(parseFloat(weight))) {
                onCompletePickup(pickup.id, parseFloat(weight));
              }
            }}><T>Complete & Record</T></button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.scheduleContainer}>
      <div className={styles.daySummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}><T>Today's Expected</T></span>
          <span className={styles.summaryValue}><T>₹{totalExpectedEarnings.toLocaleString()}</T></span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}><T>Pickups</T></span>
          <span className={styles.summaryValue}><T>{todayPickups.length}</T></span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}><T>Route Dist.</T></span>
          <span className={styles.summaryValue}><T>14.2 km</T></span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeView === 'today' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveView('today')}
        >
          <T>Today</T>
        </button>
        <button 
          className={`${styles.tabBtn} ${activeView === 'upcoming' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveView('upcoming')}
        >
          <T>Upcoming</T>
        </button>
        <button 
          className={`${styles.tabBtn} ${activeView === 'completed' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveView('completed')}
        >
          <T>Completed</T>
        </button>
      </div>

      <div className={styles.pickupList}>
        {activeView === 'today' && (
          todayPickups.length > 0 ? todayPickups.map(renderPickupCard) : <div className={styles.emptyState}><T>No pickups scheduled for today.</T></div>
        )}
        {activeView === 'upcoming' && (
          upcomingPickups.length > 0 ? upcomingPickups.map(renderPickupCard) : <div className={styles.emptyState}><T>No upcoming pickups scheduled.</T></div>
        )}
        {activeView === 'completed' && (
          completedPickups.length > 0 ? completedPickups.map(renderPickupCard) : <div className={styles.emptyState}><T>No completed pickups yet.</T></div>
        )}
      </div>
    </div>
  );
}
