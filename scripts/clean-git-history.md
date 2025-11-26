# Cleaning Secrets from Git History

The `.env` file was previously committed to the repository, exposing Supabase credentials.
Even though we removed it, the secrets still exist in git history.

## Option 1: BFG Repo-Cleaner (Recommended)

### Prerequisites
1. Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
2. Requires Java installed

### Steps

```bash
# 1. Create a fresh clone (mirror)
git clone --mirror https://github.com/lewisgithinji/Information-Assets-World.git

# 2. Create a file with secrets to remove
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcG9oeXl1Z2duZmVjZmFiY3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTE1MTEsImV4cCI6MjA3MzE2NzUxMX0.j6y0D8smJAwuC9zw0jzD40TXK2x_go0E2d1gynQC9xk" > secrets.txt

# 3. Run BFG to remove secrets
java -jar bfg.jar --replace-text secrets.txt Information-Assets-World.git

# 4. Clean up and push
cd Information-Assets-World.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (CAUTION: This rewrites history!)
git push --force
```

## Option 2: git filter-repo (Alternative)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Clone fresh
git clone https://github.com/lewisgithinji/Information-Assets-World.git clean-repo
cd clean-repo

# Remove .env from all history
git filter-repo --path .env --invert-paths

# Force push
git push origin --force --all
```

## Important Notes

1. **Rotate your Supabase anon key FIRST** before cleaning history
2. Anyone who cloned the repo before this will still have the old secrets
3. Force pushing rewrites history - coordinate with any collaborators
4. GitHub may cache old commits for a while

## After Cleaning

1. Verify the secrets are gone: `git log -p --all -S "eyJhbGciOiJIUzI1NiI"`
2. Ask GitHub to clear cached data: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
