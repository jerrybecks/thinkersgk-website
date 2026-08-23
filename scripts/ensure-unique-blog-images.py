#!/usr/bin/env python3
"""Apply the reviewed, local-only article image assignment map."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSIGNMENTS = {
    "blog/posts/ai-automation-japan-where-operational-pilots-fail-first.html": ("blog-ai-orchestration-800x500.jpg", "blog-aiops-rise-800x500.jpg"),
    "blog/posts/enterprise-ai-agent-orchestration-2026.html": ("blog-ai-orchestration-800x500.jpg", "blog-agentic-ai-800x500.jpg"),
    "blog/posts/asset-register-cleanup-japan-office.html": ("hero-asset-lifecycle-1400x600.jpg", "blog-itam-2026-800x500.jpg"),
    "blog/posts/device-lifecycle-management-japan-offices.html": ("hero-asset-lifecycle-1400x600.jpg", "blog-itam-japan-800x500.jpg"),
    "blog/posts/offboarding-device-retrieval-japan-checklist.html": ("hero-asset-lifecycle-1400x600.jpg", "blog-data-destruction-v2-800x500.jpg"),
    "blog/posts/windows-11-refresh-checklist-japan-offices.html": ("hero-asset-lifecycle-1400x600.jpg", "hero-m365-saas.source.jpg"),
    "blog/posts/intune-device-compliance-japan-office-guide.html": ("blog-microsoft-copilot-japan-2026-800x500.jpg", "blog-zero-trust-enterprise-800x500.jpg"),
    "blog/posts/itad-chain-of-custody-japan.html": ("hero-itad-1400x600.jpg", "blog-itam-japan-800x500.jpg"),
    "blog/posts/itad-japan-foreign-companies-secure-disposal-guide.html": ("hero-itad-1400x600.jpg", "blog-data-destruction-800x500.jpg"),
    "blog/posts/navigating-top-ai-automation-trends-in-japan-2026-insights-for-japanese-business.html": ("blog-ai-maturity-japan-800x500.jpg", "blog-ai-governance-japan-800x500.jpg"),
    "blog/posts/top-ai-automation-trends-for-japan-2026-what-manufacturing-and-distribution-oper.html": ("blog-ai-maturity-japan-800x500.jpg", "blog-edge-ai-industrial-800x500.jpg"),
}


def main():
    for relative, (old, new) in ASSIGNMENTS.items():
        source = ROOT / relative
        asset = ROOT / "assets" / new
        if not source.is_file() or not asset.is_file():
            raise SystemExit(f"missing source or asset for {relative}: {new}")
        text = source.read_text(encoding="utf-8")
        count = text.count(old)
        if count == 0:
            raise SystemExit(f"old image not found in {relative}: {old}")
        source.write_text(text.replace(old, new), encoding="utf-8")
        print(f"{relative}: {old} -> {new} ({count} references)")


if __name__ == "__main__":
    main()
