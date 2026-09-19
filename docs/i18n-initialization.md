# Admin translation initialization

## Problem

The admin entry point does not import the existing i18next initialization module.
React therefore renders translation keys such as `settings.chatbot.welcomeMessage`
instead of the localized labels. All 64 statically referenced translation keys
already exist in both French and English resources.

## Contract

Initialize the existing i18next instance before React renders. French is the
default and fallback language; a saved French or English selection remains
supported. Keep UI language independent from the FR/EN content-editing tabs.
Do not duplicate labels or replace translation calls with hardcoded UI strings.

## Validation

- Check that the actual bootstrap import is present before React rendering.
- Initialize the real i18next module and verify French default and English switching.
- Check every statically referenced translation key against both resource files.
- Run lint, TypeScript, production build, and existing HTTP/authentication tests.

Completed: all 64 referenced keys resolve in both languages, and server-rendered
React labels show "Message de bienvenue" in French and "Welcome Message" in English.
The production build and HTTP smoke tests pass. The entry-point initialization
fix is deployed on the admin domain; existing open tabs require a reload.
