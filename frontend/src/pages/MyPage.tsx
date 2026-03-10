/**
 * 마이페이지 — Noir Luxe theme
 * 탭: 내 정보 / 장바구니 / 결제·예매 내역
 * 각 탭은 독립 컴포넌트로 분리하여 관심사 분리 및 코드 크기 축소
 */
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ProfileTab } from '@/components/mypage/ProfileTab';
import { HoldsTab } from '@/components/mypage/HoldsTab';
import { ReservationsTab } from '@/components/mypage/ReservationsTab';
import { fadeIn } from '@/lib/animations';

type TabId = 'profile' | 'holds' | 'reservations';

const TABS: { id: TabId; label: string }[] = [
  { id: 'profile', label: '내 정보' },
  { id: 'holds', label: '장바구니' },
  { id: 'reservations', label: '결제/예매 내역' },
];

export function MyPage() {
  const location = useLocation();
  const initialTab = (location.state as { tab?: TabId } | undefined)?.tab;
  const [tab, setTab] = useState<TabId>(
    initialTab === 'holds' || initialTab === 'reservations' ? initialTab : 'profile',
  );

  return (
    <div className="py-6">
      <h1 className="mb-6 font-display text-2xl tracking-widest text-noir-text">마이페이지</h1>

      <div className="mb-6 flex gap-1 border-b border-noir-border">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`relative px-4 py-3 text-sm font-medium transition ${
              tab === id ? 'text-amber' : 'text-noir-text-muted hover:text-noir-text'
            }`}
          >
            {label}
            {tab === id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber"
                style={{ boxShadow: '0 0 8px rgba(232,168,73,0.4)' }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial="hidden" animate="visible" exit="hidden" variants={fadeIn}>
          {tab === 'profile' && <ProfileTab />}
          {tab === 'holds' && <HoldsTab />}
          {tab === 'reservations' && <ReservationsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
