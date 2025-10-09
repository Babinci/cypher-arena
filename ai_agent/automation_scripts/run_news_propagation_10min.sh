#!/bin/bash

# Configuration variables
VENV_PATH="/home/wojtek/cypher-arena/.venv"
NEWS_PROPAGATION_SCRIPT="/home/wojtek/cypher-arena/ai_agent/news_propagation.py"

# Check if virtual environment exists
if [ ! -d "$VENV_PATH" ]; then
    echo "Error: Virtual environment not found at $VENV_PATH"
    exit 1
fi

# Check if news propagation script exists
if [ ! -f "$NEWS_PROPAGATION_SCRIPT" ]; then
    echo "Error: News propagation script not found at $NEWS_PROPAGATION_SCRIPT"
    exit 1
fi

echo "Starting news propagation script with --last-two-months flag for 10 minutes..."
echo "Virtual environment: $VENV_PATH"
echo "Script: $NEWS_PROPAGATION_SCRIPT"
echo "Duration: 10 minutes"
echo "---"

# Activate virtual environment and run the script with timeout
source "$VENV_PATH/bin/activate"
timeout 10m python "$NEWS_PROPAGATION_SCRIPT" --last-two-months

# Check the exit status
EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
    echo "Script completed: 10-minute timeout reached"
elif [ $EXIT_CODE -eq 0 ]; then
    echo "Script completed successfully"
else
    echo "Script exited with code: $EXIT_CODE"
fi

deactivate
echo "Automation script finished."