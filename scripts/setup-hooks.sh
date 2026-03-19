# setup-hooks.sh: Initializes python venv and installs pre-commit hooks

# Ensure TTY for interactive steps if needed
if [ ! -t 0 ] && [ "$CI" != "true" ]; then
    echo "Warning: Not running in a TTY"
fi

# Check for python3
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed. Please install it to continue."
    exit 1
fi

# Debian-specific check: many Debian/Ubuntu systems split venv into python3-venv
if ! python3 -m venv --help &> /dev/null; then
    echo "Error: python3-venv is missing. On Debian/Ubuntu, run: sudo apt-get install python3-venv"
    exit 1
fi

# Create venv if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating python virtual environment in .venv..."
    python3 -m venv .venv
fi

# Install/Update pre-commit
echo "Ensuring pre-commit is installed..."
.venv/bin/pip install --upgrade pip -q
.venv/bin/pip install pre-commit -q

# Install git hooks
echo "Installing git hooks (pre-commit, commit-msg)..."
.venv/bin/pre-commit install --hook-type pre-commit --hook-type commit-msg

echo "✅ Development environment setup complete!"
