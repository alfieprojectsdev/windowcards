# Web Claude Instructions - Window Cards

**Created:** 2025-11-08
**For Instance:** windowcards Web Claude or CLI Claude
**Priority:** LOW (Analytics only)
**Source:** Cross-project lessons from Washboard

---

## 🎯 Mission

Add privacy-friendly analytics to track worksheet usage.

---

## 📊 GoatCounter Analytics

### Current Status

✅ **Level 1 already implemented** (pageview tracking)

---

### Level 2: Event Tracking (OPTIONAL - 15 minutes)

Since windowcards is a static site with JavaScript-generated worksheets, you can track user interactions:

**Add to your main JavaScript file:**
```javascript
// analytics.js
function trackEvent(eventName) {
  if (typeof window !== 'undefined' && window.goatcounter) {
    window.goatcounter.count({
      path: `/event/${eventName}`,
      title: eventName,
      event: true
    });
  }
}

// Track worksheet generation
document.getElementById('generate-btn').addEventListener('click', () => {
  trackEvent('worksheet-generated');
  // ... existing generation logic
});

// Track print
window.addEventListener('beforeprint', () => {
  trackEvent('worksheet-printed');
});

// Track customization usage
document.getElementById('custom-words').addEventListener('change', (e) => {
  if (e.target.value.length > 0) {
    trackEvent('custom-words-used');
  }
});

// Track difficulty selection
document.querySelectorAll('[name="difficulty"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    trackEvent(`difficulty-${e.target.value}-selected`);
  });
});
```

**Events to track:**
- `worksheet-generated` - User generates worksheet
- `worksheet-printed` - User prints
- `custom-words-used` - User adds custom words
- `difficulty-easy-selected` - Easy mode
- `difficulty-medium-selected` - Medium mode
- `difficulty-hard-selected` - Hard mode

**Privacy:** ✅ No personal data tracked (just anonymous usage patterns)

---

## ✅ Acceptance Criteria

**If implementing Level 2:**
- [ ] Event tracking added to user interactions
- [ ] Production-only (no test tracking)
- [ ] No personal data tracked
- [ ] Events visible in GoatCounter dashboard

---

## 🚀 Quick Start

**Option A: Skip (Recommended)**
Level 1 pageviews already provide good insights for a static site.

**Option B: Add Level 2 (15 minutes)**
1. Create `analytics.js` with trackEvent function
2. Add event listeners to user interactions
3. Test in production
4. Verify events in GoatCounter dashboard

---

## 📚 Reference

**Full patterns:** `/home/ltpt420/repos/claude-config/coordination/CROSS_PROJECT_LESSONS_LEARNED.md`

**Note:** Windowcards is static HTML - no auth, no database, no security concerns. Analytics is the only applicable pattern.

---

*Auto-synced from `/home/ltpt420/repos/claude-config/coordination/handoffs/windowcards.md`*
*Last synced: 2025-11-08*
