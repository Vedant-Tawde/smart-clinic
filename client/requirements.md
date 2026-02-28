## Packages
date-fns | Formatting dates and times nicely
recharts | Beautiful analytics charts for the dashboard
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility to merge tailwind classes safely
@tanstack/react-query | (Already in base, but ensuring it's used for all data fetching)
lucide-react | Icons

## Notes
- Assuming `@shared/routes` exists and exports the provided `api` and `buildUrl`.
- The application uses an authenticated session. The `/api/me` endpoint will return 401 if unauthenticated, redirecting to `/login`.
- Standard Shadcn UI components (Card, Button, Input, Dialog, etc.) are expected to be present in `client/src/components/ui/` as per the provided directory structure.
