## 2026-10-12 - Add Tooltips for Disabled Auction Bids
**Learning:** When users have insufficient funds during a live auction, disabled bid buttons lack context, leading to confusion. The custom UI `<Button>` component inherently supports robust tooltip handling for disabled states by wrapping the button in a focusable span.
**Action:** Always provide an explanatory `tooltip` prop on interactive elements that are disabled due to game state conditions, such as lack of capital or expired events, to clarify why the action is restricted.
