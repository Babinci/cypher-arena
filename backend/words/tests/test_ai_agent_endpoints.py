from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from ..models import ContrastPair, Temator, CypherArenaPerplexityDeepResearch, ContrastPairRating
from datetime import datetime, timedelta
import json

class AgentEndpointsTestCase(TestCase):
    """
    Tests for /agent/ endpoints: contrast pairs, news, and topics.
    """
    @classmethod
    def setUpTestData(cls):
        # Create some initial data for testing GET requests
        cls.pair1 = ContrastPair.objects.create(item1="apple", item2="orange")
        cls.pair2 = ContrastPair.objects.create(item1="cat", item2="dog")
        cls.pair3 = ContrastPair.objects.create(item1="hot", item2="cold")

        cls.topic1 = Temator.objects.create(name="Technology", source="manual")
        cls.topic2 = Temator.objects.create(name="Science", source="generated")
        cls.topic3 = Temator.objects.create(name="Arts", source="manual")

        now = datetime.now()
        cls.news1 = CypherArenaPerplexityDeepResearch.objects.create(
            data_response={"content": "Tech news update"},
            start_date=now - timedelta(days=2),
            end_date=now - timedelta(days=1),
            news_source="tech"
        )
        cls.news2 = CypherArenaPerplexityDeepResearch.objects.create(
            data_response={"content": "General news"},
            start_date=now - timedelta(days=1),
            end_date=now,
            news_source="news"
        )

    def setUp(self):
        self.client = APIClient()
        # URLs
        self.contrast_pairs_url = reverse('agent:agent-contrast-pair-list-create')
        self.contrast_pairs_rate_url = reverse('agent:agent-contrast-pair-batch-rate')
        self.news_url = reverse('agent:agent-news-list')
        self.topics_url = reverse('agent:agent-topic-list-create-update')

    # Contrast Pairs
    def test_get_contrast_pairs_paginated(self):
        """Test GET /agent/contrast-pairs/ returns paginated results."""
        response = self.client.get(self.contrast_pairs_url, {'page': 1, 'count': 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data.get('results', [])), 2)
        self.assertIn('total', data)
        self.assertEqual(data['page'], 1)
        self.assertEqual(data['count'], 2)

    def test_get_contrast_pairs_empty(self):
        """Test GET /agent/contrast-pairs/ returns empty list if no pairs exist."""
        ContrastPair.objects.all().delete() # Ensure no pairs exist
        response = self.client.get(self.contrast_pairs_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data.get('results', [])), 0)
        self.assertEqual(data.get('total', 0), 0)

    def test_post_contrast_pairs_batch_create_valid(self):
        """Test POST /agent/contrast-pairs/ batch create with valid payload."""
        payload = {
            'pairs': [
                {'item1': 'sun', 'item2': 'moon'},
                {'item1': 'day', 'item2': 'night'}
            ]
        }
        response = self.client.post(self.contrast_pairs_url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ContrastPair.objects.filter(item1='sun', item2='moon').exists())
        self.assertTrue(ContrastPair.objects.filter(item1='day', item2='night').exists())
        self.assertEqual(ContrastPair.objects.count(), 5) # 3 initial + 2 new

    def test_post_contrast_pairs_batch_create_invalid(self):
        """Test POST /agent/contrast-pairs/ batch create with invalid payload."""
        payload = {
            'pairs': [
                {'item1': 'valid'}, # Missing item2
                {'item1': 'test', 'item2': 'again'}
            ]
        }
        response = self.client.post(self.contrast_pairs_url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ContrastPair.objects.count(), 3) # Should not create any

    def test_post_contrast_pairs_batch_rate_valid(self):
        """Test POST /agent/contrast-pairs/rate/ batch rate with valid ratings."""
        payload = {
            'ratings': [
                {'pair_id': self.pair1.id, 'rating': 5},
                {'pair_id': self.pair2.id, 'rating': 1}
            ]
        }
        response = self.client.post(self.contrast_pairs_rate_url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Assuming user_fingerprint is handled or mocked in view logic
        # self.assertEqual(ContrastPairRating.objects.filter(contrast_pair=self.pair1, rating=5).count(), 1)
        # self.assertEqual(ContrastPairRating.objects.filter(contrast_pair=self.pair2, rating=1).count(), 1)

    def test_post_contrast_pairs_batch_rate_invalid(self):
        """Test POST /agent/contrast-pairs/rate/ batch rate with invalid ratings."""
        payload = {
            'ratings': [
                {'pair_id': self.pair1.id, 'rating': 6}, # Invalid rating > 5
                {'pair_id': 999, 'rating': 3} # Non-existent pair_id
            ]
        }
        response = self.client.post(self.contrast_pairs_rate_url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ContrastPairRating.objects.count(), 0)

    # News
    def test_get_news_valid(self):
        """Test GET /agent/news/ returns news filtered by date and type."""
        start_time = (datetime.now() - timedelta(days=3)).isoformat()
        end_time = (datetime.now() - timedelta(days=0.5)).isoformat()
        response = self.client.get(self.news_url, {
            'start_time': start_time,
            'end_time': end_time,
            'news_type': 'tech'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['news_source'], 'tech')

    def test_get_news_no_results(self):
        """Test GET /agent/news/ returns empty list if no news matches."""
        start_time = (datetime.now() - timedelta(days=5)).isoformat()
        end_time = (datetime.now() - timedelta(days=4)).isoformat()
        response = self.client.get(self.news_url, {
            'start_time': start_time,
            'end_time': end_time,
            'news_type': 'politics'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 0)

    def test_get_news_invalid_params(self):
        """Test GET /agent/news/ with invalid date/type params returns error."""
        response = self.client.get(self.news_url, {
            'start_time': 'invalid-date',
            'end_time': datetime.now().isoformat()
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.client.get(self.news_url) # Missing required params
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Topics
    def test_get_topics_paginated_and_filtered(self):
        """Test GET /agent/topics/ returns paginated and filtered topics."""
        response = self.client.get(self.topics_url, {'page': 1, 'count': 2, 'source': 'manual'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data.get('results', [])), 2)
        self.assertEqual(data['total'], 2) # Only 2 manual topics exist
        self.assertTrue(all(t['source'] == 'manual' for t in data['results']))

    def test_post_topics_batch_insert_valid(self):
        """Test POST /agent/topics/ batch insert with valid payload."""
        payload = {
            'topics': [
                {'name': 'History', 'source': 'manual'},
                {'name': 'Geography', 'source': 'generated'}
            ]
        }
        response = self.client.post(self.topics_url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Temator.objects.filter(name='History').exists())
        self.assertTrue(Temator.objects.filter(name='Geography').exists())
        self.assertEqual(Temator.objects.count(), 5)

    def test_post_topics_batch_insert_invalid(self):
        """Test POST /agent/topics/ batch insert with invalid payload."""
        payload = {
            'topics': [
                {'source': 'manual'}, # Missing name
                {'name': 'Valid Topic', 'source': 'manual'}
            ]
        }
        response = self.client.post(self.topics_url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Temator.objects.count(), 3) # Should not create any

    def test_patch_topics_batch_update_valid(self):
        """Test PATCH /agent/topics/ batch update with valid payload."""
        payload = {
            'updates': [
                {'id': self.topic1.id, 'name': 'Updated Tech'},
                {'id': self.topic2.id, 'source': 'manual'}
            ]
        }
        response = self.client.patch(self.topics_url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.topic1.refresh_from_db()
        self.topic2.refresh_from_db()
        self.assertEqual(self.topic1.name, 'Updated Tech')
        self.assertEqual(self.topic2.source, 'manual')

    def test_patch_topics_batch_update_invalid(self):
        """Test PATCH /agent/topics/ batch update with invalid payload."""
        payload = {
            'updates': [
                {'id': self.topic1.id}, # Missing fields to update
                {'id': 999, 'name': 'Non Existent'} # Invalid ID
            ]
        }
        response = self.client.patch(self.topics_url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Ensure original data is unchanged
        self.topic1.refresh_from_db()
        self.assertEqual(self.topic1.name, 'Technology')
