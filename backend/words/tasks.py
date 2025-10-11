from .perplexity_deep_research import search_internet
from celery import shared_task
from datetime import datetime, timedelta
import subprocess
import os


@shared_task
def daily_search():
    end_date = datetime.now()- timedelta(days=1)
    start_date = end_date - timedelta(days=2)

    for name in ["general_news", "polish_showbiznes"]:
        search_internet(start_date, end_date, search_model="sonar-pro", name=name)


@shared_task
def run_news_propagation():
    """Execute the news propagation automation script."""
    script_path = '/home/wojtek/cypher-arena/ai_agent/automation_scripts/run_news_propagation_10min.sh'

    try:
        # Run the shell script
        result = subprocess.run(
            ['bash', script_path],
            capture_output=True,
            text=True,
            timeout=600  # 10 minutes timeout
        )

        if result.returncode == 0:
            return f"News propagation script executed successfully. Output: {result.stdout}"
        else:
            return f"Script execution failed with error: {result.stderr}"

    except subprocess.TimeoutExpired:
        return "Script execution timed out after 5 minutes"
    except Exception as e:
        return f"Error running script: {str(e)}"
