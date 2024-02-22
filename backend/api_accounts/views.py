from django.shortcuts import redirect, HttpResponse
from django.contrib.auth import login, logout, get_user_model
from django.contrib.auth.hashers import check_password
from django.core.files.base import ContentFile
from django.conf import settings
from django.db import transaction
from django.db.models import Q, Max
from django.utils import timezone

from django.http import JsonResponse, HttpResponseRedirect
from django.core.exceptions import ValidationError

from rest_framework import viewsets, status, permissions, generics, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import Player, ExpiredTokens, Notification, MatchHistory, Tournament, TournamentMatch
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, NotificationSerializer, DeleteAccountSerializer, TwoFactorSetupSerializer, MatchHistorySerializer, TournamentSerializer, TournamentMatchSerializer
from .validations import custom_validation, email_validation, password_validation, username_validation
from .authentication import ExpiredTokensJWTAuthentication

import os
import urllib.parse
from urllib.parse import urlencode
import requests
import pyotp
import logging
import random

logger = logging.getLogger(__name__)

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
            two_factor_code = data.get('2fa_token', None)

            if user.is_two_factor_enabled and not two_factor_code:
                return Response({'require_2fa': True}, status=status.HTTP_200_OK)

            if user.is_two_factor_enabled:
                if not user.verify_totp(two_factor_code):
                    return Response({'error': 'Invalid 2FA code'}, status=status.HTTP_400_BAD_REQUEST)

            login(request, user)
            token = RefreshToken.for_user(user)
            return Response({
                'access': str(token.access_token),
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

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
        serializer = UserSerializer(queryset, many=True, context={'request': request})
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
            error = request.GET.get('error')
            if error or not code:
                return HttpResponseRedirect('/')
            data = {
                "grant_type": "authorization_code",
                "client_id": os.getenv("CLIENT_ID"),
                "client_secret": os.getenv("CLIENT_SECRET"),
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
                window.location.href = "https://10.12.14.3";
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
            "client_id": os.getenv("CLIENT_ID"),
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

class UnreadNotifications(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        notifications = Notification.objects.filter(receiver=request.user, is_read=False)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_as_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, receiver=request.user)
        notification.is_read = True
        notification.save()
        return Response({'success': 'Notification marked as read!'}, status=status.HTTP_200_OK)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found!'}, status=status.HTTP_404_NOT_FOUND)

User = get_user_model()

class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, format=None):
        serializer = DeleteAccountSerializer(data=request.data)
        if serializer.is_valid():
            if serializer.validated_data['confirm'] == 'DELETE':
                request.user.delete()
                return Response({'success': 'Account deleted successfully!'}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({'error': 'Invalid input!'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class EnableTwoFactorAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = TwoFactorSetupSerializer(instance=user, data={'enable_2fa': True})
        if serializer.is_valid():
            user = serializer.save()
            totp_uri = pyotp.TOTP(user.totp_secret).provisioning_uri(user.email, issuer_name='PingPongTranscendence')
            return Response({'otp_uri': totp_uri}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class VerifyTwoFactorAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        two_factor_code = request.data.get('2fa_code')

        if not two_factor_code or not user.verify_totp(two_factor_code):
            return Response({'error': 'Invalid 2FA code'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_two_factor_enabled = True
        user.save()
        return Response({'message': '2FA verification successful'}, status=status.HTTP_200_OK)
    
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_stats(request):
    winner_username = request.data.get('winner')
    loser_username = request.data.get('loser')
    game_completed = request.data.get('gameCompleted', False)

    try:
        winner = User.objects.get(username=winner_username)
        winner_registered = True
    except User.DoesNotExist:
        winner_registered = False
    try:
        loser = User.objects.get(username=loser_username)
        loser_registered = True
    except User.DoesNotExist:
        loser_registered = False

    if game_completed:
        if winner_registered:
            winner.games_played += 1
            winner.games_won += 1
            winner.save()
        
        if loser_registered:
            loser.games_played += 1
            loser.games_lost += 1
            loser.save()

        if winner_registered or loser_registered:
            return JsonResponse({'success': 'Stats updated successfully!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'No registered user found!'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'error': 'Game not completed!'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not check_password(old_password, user.password):
        return Response({'error': 'Invalid old password!'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    return Response({'success': 'Password changed successfully!'}, status=status.HTTP_200_OK)

class MatchHistoryListCreate(generics.ListCreateAPIView):
    serializer_class = MatchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MatchHistory.objects.filter(Q(player1=user) | Q(player2=user)).order_by('-date_played')

    def perform_create(self, serializer):
        player1_username = self.request.user.username
        player2_username = serializer.validated_data.get('player2')
        winner_username = serializer.validated_data.get('winner')

        if player2_username:
            if not User.objects.filter(username=player2_username).exists():
                player2_username = player2_username
        else:
            player2_username = player2_username

        if winner_username:
            if not User.objects.filter(username=winner_username).exists():
                winner_username = winner_username
        else:
            winner_username = winner_username

        serializer.save(player1=player1_username, player2=player2_username)

@api_view(['POST'])
def update_login_status(request):
    if request.method == 'POST':
        try:
            user = request.user
            user.is_logged_in = request.data.get('is_logged_in', False)
            user.save()
            return Response({'success': 'Login status updated successfully!'}, status=status.HTTP_200_OK)
        except Player.DoesNotExist:
            return Response({'error': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'error': 'Invalid request method!'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
class TournamentCreateView(generics.CreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

class TournamentListView(generics.ListAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]

class TournamentDetailView(generics.RetrieveAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def register_to_tournament(request, tournament_id):
    try:
        with transaction.atomic():
            tournament = Tournament.objects.select_for_update().get(id=tournament_id)

            if tournament.status != 'Upcoming':
                return Response({'error': 'Tournament registration is closed!'}, status=status.HTTP_400_BAD_REQUEST)
            
            if tournament.participants.count() >= 4:
                return Response({'error': 'Tournament is already full!'}, status=status.HTTP_400_BAD_REQUEST)
            
            if request.user in tournament.participants.all():
                return Response({'error': 'You are already registered to this tournament!'}, status=status.HTTP_400_BAD_REQUEST)
            
            tournament.participants.add(request.user)

            # check if tournament is full
            if tournament.participants.count() == 4:
                tournament.status = 'Ongoing'
                tournament.save()
                setup_tournament_matches(tournament)
                notify_participants(tournament)

            return Response({'success': 'Registered to tournament successfully!'}, status=status.HTTP_200_OK)
    
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found!'}, status=status.HTTP_404_NOT_FOUND)

def setup_tournament_matches(tournament):
    participants = list(tournament.participants.all())
    random.shuffle(participants) # randomize participant order

    max_round_number = tournament.matches.aggregate(Max('match_round'))['match_round__max'] or 0
    round_number = max_round_number + 1

    while len(participants) >= 2:
        player1 = participants.pop(0)
        player2 = participants.pop(0)

        # create a match for these 2 players
        TournamentMatch.objects.create(
            tournament=tournament,
            player1=player1,
            player2=player2,
            scheduled_time=timezone.now(),
            match_round=round_number
        )

    if participants:
        lone_player = participants[0]
        TournamentMatch.objects.create(
            tournament=tournament,
            player1=lone_player,
            player2=None,
            scheduled_time=None,
            match_round=round_number
        )

def notify_participants(tournament):
    max_round_number = tournament.matches.aggregate(Max('match_round'))['match_round__max']
    matches = TournamentMatch.objects.filter(tournament=tournament, match_round=max_round_number)

    for match in matches:
        if match.player2:
            message_to_player1 = f"You have a match against {match.player2.username} in Tournament-ID: '{tournament.id}'. Your Match-ID is '{match.id}'."
            message_to_player2 = f"You have a match against {match.player1.username} in Tournament-ID: '{tournament.id}'. Your Match-ID is '{match.id}'."

            Notification.objects.create(receiver=match.player1, message=message_to_player1, is_read=False)
            Notification.objects.create(receiver=match.player2, message=message_to_player2, is_read=False)
        else:

            message_to_player1 = f"You will advance to the next round in Tournament-ID: '{tournament.id}' due to a bye."
            Notification.objects.create(receiver=match.player1, message=message_to_player1, is_read=False)
    
    if tournament.status == 'Finals' or tournament.status == 'Finished':
        final_match = matches.first()
        if final_match and final_match.winner:
            message = f"Congratulations! You have won the tournament '{tournament.name}'!"
            Notification.objects.create(receiver=final_match.winner, message=message, is_read=False)

            if final_match.player2:
                loser = final_match.player1 if final_match.winner == final_match.player2 else final_match.player2
                message = f"You finished as runner-up in the tournament '{tournament.name}'."
                Notification.objects.create(receiver=loser, message=message, is_read=False)

class TournamentMatchCreateView(generics.CreateAPIView):
    queryset = TournamentMatch.objects.all()
    serializer_class = TournamentMatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

class TournamentMatchDetailView(generics.RetrieveAPIView):
    queryset = TournamentMatch.objects.all()
    serializer_class = TournamentMatchSerializer
    permission_classes = [permissions.IsAuthenticated]

class TournamentMatchUpdateView(generics.UpdateAPIView):
    queryset = TournamentMatch.objects.all()
    serializer_class = TournamentMatchSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def setup_final_match(request, tournament_id):
    try:
        # fetch tournament
        tournament = Tournament.objects.get(id=tournament_id)

        # check if first round matches are completed
        first_round_matches = tournament.matches.filter(match_round=1)
        if first_round_matches.count() != 2 or not all([match.winner for match in first_round_matches]):
            # first round matches are not completed
            return Response({'error': 'First round matches are not completed!'}, status=status.HTTP_400_BAD_REQUEST)
        
        # extract winners of first round matches
        winners = [match.winner for match in first_round_matches]

        # create a final match
        final_match = TournamentMatch.objects.create(
            tournament=tournament,
            player1=winners[0],
            player2=winners[1],
            scheduled_time=timezone.now(),
            match_round=2
        )

        # update tournament status
        tournament.status = 'Finals'
        tournament.save()

        final_match_data = TournamentMatchSerializer(final_match).data

        return Response({
            'success': 'Final match setup successfully!',
            'final_match': final_match_data
        }, status=status.HTTP_200_OK)
    
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found!'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)