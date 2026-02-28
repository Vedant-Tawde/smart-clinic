#!/bin/bash
# Create the smartclinic database (run this before starting the backend)

echo "Creating smartclinic database..."

# Try common postgres setups
if command -v psql &>/dev/null; then
  psql -U postgres -c "CREATE USER smartclinic WITH PASSWORD 'smartclinic';" 2>/dev/null || true
  psql -U postgres -c "CREATE DATABASE smartclinic OWNER smartclinic;" 2>/dev/null || psql -U postgres -c "CREATE DATABASE smartclinic;"
  echo "Done. Database 'smartclinic' ready."
else
  echo "PostgreSQL not found. Install it first:"
  echo "  macOS: brew install postgresql@16"
  echo "  Ubuntu: sudo apt install postgresql"
  echo ""
  echo "Then create the database manually:"
  echo "  createdb smartclinic"
  echo "  # or: psql -U postgres -c \"CREATE DATABASE smartclinic;\""
fi
