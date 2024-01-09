from django.shortcuts import render, redirect
from django.db.models import Q
from django.contrib.auth import authenticate, login, logout
from rest_framework import viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Player, Game, Tournament, TournamentGame
from .serializers import PlayerSerializer, GameSerializer, TournamentSerializer, TournamentGameSerializer
from .forms import CustomUserCreationForm

# Create your views here.

def main_page(request):
    return render(request, 'main_page/index.html', {})

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['GET'])
    def game_history(self, request, pk=None):
        player = self.get_object()
        games = Game.objects.filter(Q(player1=player) | Q(player2=player))
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def perform_create(self, serializer):
        if Tournament.objects.filter(name=serializer.validated_data['name']).exists():
            raise serializers.ValidationError("Tournament name must be unique!")
        serializer.save()

class TournamentGameViewSet(viewsets.ModelViewSet):
    queryset = TournamentGame.objects.all()
    serializer_class = TournamentGameSerializer

def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('registration/login.html')
    else:
        form = CustomUserCreationForm()
        return render(request, 'registration/register.html', {'form': form})