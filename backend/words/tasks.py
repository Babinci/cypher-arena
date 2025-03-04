from .perplexity_deep_research import search_internet
from celery import shared_task
from datetime import datetime, timedelta


@shared_task
def daily_search():
    end_date = datetime.now()- timedelta(days=1)
    start_date = end_date - timedelta(days=2)

    for name in ["general_news", "polish_showbiznes"]:
        search_internet(start_date, end_date, search_model="sonar-pro", name=name)
