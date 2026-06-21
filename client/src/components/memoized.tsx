/**
 * Memoized Components
 * These components are wrapped with React.memo to prevent unnecessary re-renders
 * when their props haven't changed
 */

import { memo } from 'react';
import Pitch from './Pitch';
import ChipsSelector from './ChipsSelector';
import TransferDeadlineCountdown from './TransferDeadlineCountdown';
import DashboardLayoutSkeleton from './DashboardLayoutSkeleton';
import LoadingSpinner from './LoadingSpinner';

// Memoize expensive components
export const MemoizedPitch = memo(Pitch);
export const MemoizedChipsSelector = memo(ChipsSelector);
export const MemoizedTransferDeadlineCountdown = memo(TransferDeadlineCountdown);
export const MemoizedDashboardLayoutSkeleton = memo(DashboardLayoutSkeleton);
export const MemoizedLoadingSpinner = memo(LoadingSpinner);

// Export original components as well for backward compatibility
export { Pitch, ChipsSelector, TransferDeadlineCountdown, DashboardLayoutSkeleton, LoadingSpinner };
