import { Music2 } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Back to homepage">
      <Music2 className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold font-headline">
        TuneConnect
      </span>
    </Link>
  );
}
