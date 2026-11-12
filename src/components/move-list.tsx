import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';

import { colors, radius, spacing } from '@/theme/colors';

type MoveListProps = {
  moves: string[];
  width: number;
};

export function MoveList({ moves, width }: MoveListProps) {
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [moves.length]);

  const rows: { number: number; white: string; black?: string }[] = [];

  for (let index = 0; index < moves.length; index += 2) {
    rows.push({
      number: index / 2 + 1,
      white: moves[index],
      black: moves[index + 1],
    });
  }

  return (
    <View style={[styles.card, { width }]}>
      <Text style={styles.title}>Moves</Text>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator>
        {rows.length === 0 ? (
          <Text style={styles.empty}>No moves yet</Text>
        ) : (
          rows.map((row) => (
            <View key={row.number} style={styles.row}>
              <Text style={styles.number}>{row.number}.</Text>
              <Text style={styles.move}>{row.white}</Text>
              <Text style={styles.move}>{row.black ?? ''}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.sm + 2,
    paddingTop: spacing.xs + 2,
    paddingBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  title: {
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  scroll: {
    height: 62,
  },
  content: {
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
  },
  number: {
    width: 28,
    fontSize: 12,
    color: colors.textMuted,
  },
  move: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  empty: {
    paddingTop: spacing.sm,
    fontSize: 12,
    color: colors.textMuted,
  },
});
