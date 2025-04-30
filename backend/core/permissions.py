from rest_framework.permissions import BasePermission
from core.settings import AI_AGENT_SECRET_KEY

class IsValidSecretKey(BasePermission):
    """
    Custom permission to only allow access if the correct secret key is provided in the 'X-Secret-Key' header.
    """
    def has_permission(self, request, view):
        secret_key = request.headers.get('X-Secret-Key')
        return secret_key == AI_AGENT_SECRET_KEY
