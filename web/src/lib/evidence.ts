import type { FrontendVerdict } from "../../../shared/types";
import { evaluate } from "../../../shared/math";
export function downloadEvidence(record: FrontendVerdict) {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          notice:
            record.provenance === "synthetic"
              ? "Synthetic example; not historical evidence"
              : "Backend-supplied evidence; independently verify against chain",
          record,
          referenceCalculation: evaluate(record.position),
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const href = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = href;
  link.download = `redress-${record.id.replace(/[^a-zA-Z0-9-]/g, "")}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(href), 0);
}
