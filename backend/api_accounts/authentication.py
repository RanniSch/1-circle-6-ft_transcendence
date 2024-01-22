from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions

from .models import ExpiredTokens

class ExpiredTokensJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        data = super().authenticate(request)
        if data is not None:
            token = request.META.get('HTTP_AUTHORIZATION', " ").split(' ')[1]
            is_expired = ExpiredTokens.objects.filter(token=token).exists()
            if is_expired:
                raise exceptions.AuthenticationFailed('Token is expired! Please login again!')
        return data