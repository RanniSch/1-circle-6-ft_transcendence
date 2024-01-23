from urllib import response
from django.shortcuts import redirect, HttpResponse
from django.contrib.auth import login, logout, get_user_model
from django.core.files.base import ContentFile
from django.conf import settings

from django.http import JsonResponse, HttpResponseRedirect
from django.core.exceptions import ValidationError
from pkg_resources import require

from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import Player, ExpiredTokens
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, AvatarUpdateSerializer
from .validations import custom_validation, email_validation, password_validation, username_validation
from .authentication import ExpiredTokensJWTAuthentication

import os
import urllib.parse
from urllib.parse import urlencode
import requests
import secrets

# Create your views here.

class UserRegistration(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            clean_data = custom_validation(request.data)
            serializer = RegisterSerializer(data=clean_data)
            if serializer.is_valid(raise_exception=True):
                user = serializer.create(clean_data)
                if user:
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as err:
            return Response({'error': str(err)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_400_BAD_REQUEST)

class UserLogin(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        if request.user.is_authenticated:
            return Response({'information': 'You are already logged in! Please logout first!'}, status=status.HTTP_400_BAD_REQUEST)
        data = request.data
        assert email_validation(data)
        assert password_validation(data)
        serializer = LoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validate_user(data)
            login(request, user)
            token = RefreshToken.for_user(user)
            return Response({
                'access': str(token.access_token),
            }, status=status.HTTP_200_OK)

class UserLogout(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.is_authenticated:
            token = request.META.get('HTTP_AUTHORIZATION', " ").split(' ')[1]
            ExpiredTokens.objects.create(user=request.user, token=token)
            print(ExpiredTokens.objects.all())
            logout(request)
            return Response({'information': 'You have been logged out!'}, status=status.HTTP_200_OK)
        else:
            return Response({'information': 'You are not logged in!'}, status=status.HTTP_400_BAD_REQUEST)
        
class UserProfile(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [ExpiredTokensJWTAuthentication]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserView(viewsets.ModelViewSet):
    authentication_classes = [ExpiredTokensJWTAuthentication]
    queryset = Player.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        email = request.data.get('email', '')
        user = Player.objects.get(email=email)
        token = RefreshToken.for_user(user)
        response.data['refresh_token'] = str(token)
        response.data['access_token'] = str(token.access_token)
        return response
    
    def list(self, request, *args, **kwargs):
        queryset = Player.objects.exclude(id=request.user.id)
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data)

def authenticated(request):
    response = JsonResponse({'authenticated': request.user.is_authenticated})
    response['Access-Control-Allow-Credentials'] = 'true'
    return response

class OAuthCallback(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.method == 'GET':
            code = request.GET.get('code')
            data = {
                "grant_type": "authorization_code",
                "client_id": "u-s4t2ud-9c1eac966bdd22eda52986568012ba678675d5a54f0d8ec28dd59595dcf1afd1",
                "client_secret": "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",
                "code": code,
                "redirect_uri": settings.REDIRECT_URI + "/api/oauth/callback",
            }
            print("Data sent: ", data)
            auth_response = requests.post("https://api.intra.42.fr/oauth/token", data=data)
            if auth_response.status_code != 200:
                print("\t\t\tAuth callback Error: ", auth_response.json())
                return HttpResponse("Auth callback Error, please try again!")
            
            access_token = auth_response.json().get('access_token')
            if not access_token:
                return HttpResponse("Auth callback Error, error obtaining token!")

            user_response = requests.get("https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {access_token}"})
            user_data = user_response.json()
            print("User data: ", user_data)

            username = user_data.get('login')
            email = user_data.get('email', f'{username}@student.42wolfsburg.de')
            picture_url = user_data.get('image', {}).get('versions', {}).get('medium')

            custom_title = ''
            titles = user_data.get('titles', [])
            if titles:
                custom_title = titles[0].get('name', '').split()[0]
            user, created = Player.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'username': username,
                    'custom_title': custom_title,
                }
            )
            if created:
                print("\t\t\tUser added successfully!")
                response = requests.get(picture_url)
                if response.status_code == 200:
                    user.profile_avatar.save(f"{username}_profile_avatar.jpg", ContentFile(response.content))
            else:
                print("\t\t\tUser already exists!")                
            login(request, user)

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            html = f"""
            <!DOCTYPE html>
            <html>
            <body>
            <script>
            function setTokenAndRedirect(token) {{
                localStorage.setItem('access', token);
                window.location.href = "http://localhost:8000";
            }}
            // Check if window.opener is not null
            if (window.opener) {{
                window.opener.postMessage({{ 'is_authenticated': true }}, '*');
                setTokenAndRedirect('{access_token}');
            }} else {{
            setTokenAndRedirect('{access_token}');
            }}
            // Close this window
            //window.close();
            </script>
            </body>
                </html>
            """
            return HttpResponse(html)
        return HttpResponse("Auth callback Error, please try again!")

class OAuthAuthorize(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        auth_url = "https://api.intra.42.fr/oauth/authorize"
        parameters = {
            "client_id": "u-s4t2ud-9c1eac966bdd22eda52986568012ba678675d5a54f0d8ec28dd59595dcf1afd1",
            "redirect_uri": settings.REDIRECT_URI + "/api/oauth/callback",
            "response_type": "code",
        }
        return HttpResponseRedirect(f"{auth_url}?{urllib.parse.urlencode(parameters)}")
    
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_avatar(request):
    user = request.user
    file = request.FILES.get('profile_avatar')
    if not file:
        return Response({'error': 'No file provided!'}, status=status.HTTP_400_BAD_REQUEST)
    user.profile_avatar.save(f"{user.username}_profile_avatar.jpg", file, save=True)
    return Response({'success': 'Avatar updated successfully!'}, status=status.HTTP_200_OK)