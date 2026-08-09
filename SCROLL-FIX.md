Nexarvia Learning OS — Sidebar Scroll Fix

Issue:
The fixed left navigation could extend beyond the viewport without an independent scroll container.

Fix:
- Sidebar is now constrained to 100vh.
- Sidebar has its own vertical scrolling.
- Horizontal overflow is prevented.
- Native scrollbar is styled to match the Nexarvia dark UI.
- Main content remains independently scrollable.
- All previous phases and pages are retained.
