import { Text, View, StyleSheet } from "react-native";

import type { ClassStatus } from "../types/domain";

type Props = {
  status: ClassStatus;
};

const statusMap: Record<ClassStatus, { label: string; color: string; backgroundColor: string }> = {
  teaching: { label: "Teaching", color: "#14532D", backgroundColor: "#DCFCE7" },
  late: { label: "Late", color: "#7C2D12", backgroundColor: "#FFEDD5" },
  empty: { label: "Empty", color: "#7F1D1D", backgroundColor: "#FEE2E2" }
};

export const StatusBadge = ({ status }: Props) => {
  const config = statusMap[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start"
  },
  text: {
    fontWeight: "700",
    fontSize: 12
  }
});
