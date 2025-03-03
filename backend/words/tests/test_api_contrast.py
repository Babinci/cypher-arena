from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from contrasting_mode.models import ContrastPair

class ContrastPairRateActionTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.contrast_pair1 = ContrastPair.objects.create(item1="Pair 1 Item 1", item2="Pair 1 Item 2")
        self.contrast_pair2 = ContrastPair.objects.create(item1="Pair 2 Item 1", item2="Pair 2 Item 2")
        self.contrast_pair3 = ContrastPair.objects.create(item1="Pair 3 Item 1", item2="Pair 3 Item 2")

    def test_rate_contrast_pair_status_code_200(self):
        url = reverse('contrastpair-rate', kwargs={'pk': self.contrast_pair1.pk})
        response = self.client.post(url, {'rating': 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_rate_contrast_pair_bad_rating_status_code_400(self):
        url = reverse('contrastpair-rate', kwargs={'pk': self.contrast_pair1.pk})
        response = self.client.post(url, {'rating': 7}) # Rating out of range
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)