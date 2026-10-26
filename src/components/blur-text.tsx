import { STAGGER } from "@/lib/motion";

interface BlurTextProps {
  text: string;
  /** Seconds before the first word starts. */
  delay?: number;
  className?: string;
}

/**
 * Word-by-word blur-in for headings. Pure CSS (works without JS, no layout
 * shift); off under reduced motion.
 */
export function BlurText({ text, delay = 0, className }: BlurTextProps) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span
            className="animate-blur-in inline-block motion-reduce:animate-none"
            style={{ animationDelay: `${(delay + i * STAGGER) * 1000}ms` }}
          >
            {word}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </span>
  );
}
