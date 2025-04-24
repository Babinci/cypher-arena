from django.urls import path, include
from . import views 
from rest_framework.routers import DefaultRouter

# Agent endpoints
from . import agent_views

urlpatterns = [
    path('get_random_word/', views.RandomWordAPIView.as_view(), name='get_random_word'),  # For getting a random word as JSON
    path('get_topics/', views.TopicAPIView.as_view(), name='get_random_word'),  # For getting a random word as JSON
]


router = DefaultRouter()
router.register(r'contrast-pairs', views.ContrastPairViewSet)

# Agent endpoints
agent_urlpatterns = [
    path('contrast-pairs/', agent_views.AgentContrastPairListCreateAPIView.as_view(), name='agent-contrast-pair-list-create'),
    path('contrast-pairs/rate/', agent_views.AgentContrastPairBatchRateAPIView.as_view(), name='agent-contrast-pair-batch-rate'),
    path('news/', agent_views.AgentNewsListAPIView.as_view(), name='agent-news-list'),
    path('topics/', agent_views.AgentTopicListCreateUpdateAPIView.as_view(), name='agent-topic-list-create-update'),
]

urlpatterns += [
    path('', include(router.urls)),
    path('agent/', include((agent_urlpatterns, 'agent'))),
]
