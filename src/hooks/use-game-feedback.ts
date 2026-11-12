import { useEffect, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { useGameStore } from '@/store/game-store';
import { useSettingsStore } from '@/store/settings-store';

type MoveFeedback = 'move' | 'capture' | 'check' | 'game-over';

/**
 * Plays the move/capture/check/game-over sound and haptic for a committed
 * move. It watches the game snapshot, so undo and new game stay silent.
 */
export function useGameFeedback() {
  const movePlayer = useAudioPlayer(require('../../assets/sounds/move.wav'));
  const capturePlayer = useAudioPlayer(require('../../assets/sounds/capture.wav'));
  const checkPlayer = useAudioPlayer(require('../../assets/sounds/check.wav'));
  const gameOverPlayer = useAudioPlayer(require('../../assets/sounds/game-over.wav'));

  const moveCount = useGameStore((state) => state.moveCount);
  const captured = useGameStore((state) => state.captured);
  const status = useGameStore((state) => state.status);
  const turn = useGameStore((state) => state.turn);
  const mode = useGameStore((state) => state.mode);
  const humanColor = useGameStore((state) => state.humanColor);

  const previousMoveCount = useRef(moveCount);
  const previousCaptureCount = useRef(captured.w.length + captured.b.length);

  useEffect(() => {
    const previousMoves = previousMoveCount.current;
    const previousCaptures = previousCaptureCount.current;
    const captureCount = captured.w.length + captured.b.length;

    previousMoveCount.current = moveCount;
    previousCaptureCount.current = captureCount;

    // Undo and new game reduce the move count, so they stay quiet.
    if (moveCount !== previousMoves + 1) {
      return;
    }

    const feedback: MoveFeedback = status.isOver
      ? 'game-over'
      : status.kind === 'check'
        ? 'check'
        : captureCount > previousCaptures
          ? 'capture'
          : 'move';

    const settings = useSettingsStore.getState();

    if (settings.soundEnabled) {
      const player =
        feedback === 'game-over'
          ? gameOverPlayer
          : feedback === 'check'
            ? checkPlayer
            : feedback === 'capture'
              ? capturePlayer
              : movePlayer;

      void player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => {
          // The player may still be loading on the very first move.
        });
    }

    if (!settings.hapticsEnabled) {
      return;
    }

    // Haptics are for the player's own moves; sound still announces the AI's.
    const mover = turn === 'w' ? 'b' : 'w';
    const isHumanMove = mode !== 'computer' || mover === humanColor;

    if (!isHumanMove) {
      return;
    }

    if (feedback === 'game-over') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (feedback === 'check') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (feedback === 'capture') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [
    captured,
    capturePlayer,
    checkPlayer,
    gameOverPlayer,
    humanColor,
    mode,
    moveCount,
    movePlayer,
    status,
    turn,
  ]);
}
