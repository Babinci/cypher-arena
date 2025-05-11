from rest_framework.permissions import BasePermission
from rest_framework import exceptions
from core.settings import AI_AGENT_SECRET_KEY
class AgentTokenPermission(BasePermission):
    """
    Allows access only to requests with a valid X-AGENT-TOKEN header.
    """
    AGENT_HEADER = 'HTTP_X_AGENT_TOKEN'  # Django prefixes HTTP headers
    EXPECTED_TOKEN = AI_AGENT_SECRET_KEY

    def has_permission(self, request, view):
        token = request.META.get(self.AGENT_HEADER)
        if not token or token != self.EXPECTED_TOKEN:
            raise exceptions.PermissionDenied('Invalid or missing agent token.')
        return True
