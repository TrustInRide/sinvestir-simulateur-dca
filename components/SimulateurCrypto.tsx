import { Simulator } from "@/components/Simulator";

interface SimulateurCryptoProps {
  className?: string;
  defaultCoin?: string;
  embedded?: boolean;
}

export function SimulateurCrypto({
  className,
  defaultCoin,
  embedded,
}: SimulateurCryptoProps) {
  return (
    <div
      className={
        className ??
        (embedded ? "px-4 py-4" : "mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14")
      }
    >
      <Simulator defaultCoin={defaultCoin} />
    </div>
  );
}

export default SimulateurCrypto;
