from django.db import models
from django.utils import timezone

# Create your models here.

class Player(models.Model):
    alias = models.CharField(max_length=10)
    create_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.alias

class Game(models.Model):
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1_games')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2_games')
    winner = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, blank=True)

class Tournament(models.Model):
    name = models.CharField(max_length=25)
    players = models.ManyToManyField(Player, related_name='tournaments')

    def __str__(self):
        return self.name

class TournamentGame(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1_tournament_games')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2_tournament_games')
    winner = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, blank=True)