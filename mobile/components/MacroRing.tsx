import { IntakeRing } from "@/components/IntakeRing";

type Props = { label: string; value: number; target: number; color: string };

const RING_SIZE = 80;

export function MacroRing({ label, value, target, color }: Props) {
  return <IntakeRing label={label} value={value} target={target} color={color} unit="g" size={RING_SIZE} />;
}
