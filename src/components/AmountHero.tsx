import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";
import { formatEur } from "../domain";

interface Props {
  spentMinor: number;
  forecastMinor: number;
}

function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => formatEur(Math.round(v)));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, mv, reduce]);

  return <motion.div className="amount">{rounded}</motion.div>;
}

export function AmountHero({ spentMinor, forecastMinor }: Props) {
  return (
    <div className="hero-dual" aria-live="polite">
      <div className="hero-panel">
        <div className="label">Gastado este mes</div>
        <CountUp value={spentMinor} />
      </div>
      <div className="hero-panel forecast">
        <div className="label">Previsto</div>
        <CountUp value={forecastMinor} />
      </div>
    </div>
  );
}
