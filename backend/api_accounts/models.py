from sqlite3 import Timestamp
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, Group, Permission
from django.contrib.auth.base_user import BaseUserManager

import pyotp

# Create your models here.

class PlayerManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address!')
        if not password:
            raise ValueError('Users must have a password!')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if not email:
            raise ValueError('Even staff must have an email address!')
        if not password:
            raise ValueError('Even staff must have a password!')
        
        user = self.create_user(email, password, **extra_fields)
        user.is_staff = True
        user.save(using=self._db)
        return user
        
class Player(AbstractBaseUser, PermissionsMixin):
    is_staff = models.BooleanField(default=True)

    profile_avatar = models.ImageField(upload_to='./', null=True, blank=True, default='./default_avatar.jpg')
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=75, unique=True)
    username = models.CharField(max_length=25, unique=True, null=True, blank=True)
    games_played = models.PositiveIntegerField(default=0)
    games_won = models.PositiveIntegerField(default=0)
    games_lost = models.PositiveIntegerField(default=0)
    games_tied = models.PositiveIntegerField(default=0)
    date_joined = models.DateTimeField(auto_now_add=True)
    custom_title = models.CharField(max_length=75, null=True, blank=True)
    totp_secret = models.CharField(max_length=100, default=pyotp.random_base32())
    is_two_factor_enabled = models.BooleanField(default=False)
    is_logged_in = models.BooleanField(default=False)

    def verify_totp(self, token):
        totp = pyotp.TOTP(self.totp_secret)
        return totp.verify(token)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    objects = PlayerManager()

    groups = models.ManyToManyField(
        Group,
        related_name="player_groups",
        blank=True,
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name="player_permissions",
        blank=True,
    )

    def __str__(self):
        return self.username
    
class ExpiredTokens(models.Model):
    token = models.CharField(max_length=500)
    user = models.ForeignKey(Player, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['token', 'user']

User = get_user_model()

class Notification(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True)
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_notifications')
    message = models.TextField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_system_generated = models.BooleanField(default=False)

    def __str__(self):
        if self.is_system_generated:
            return f"System Notification to {self.receiver.username}"
        else:
            sender_username = self.sender.username if self.sender else 'System'
            return f"Notification from {sender_username} to {self.receiver.username}"
    
class MatchHistory(models.Model):
    player1 = models.CharField(max_length=100)
    player2 = models.CharField(max_length=100, null=True, blank=True)
    winner = models.CharField(max_length=100, null=True, blank=True)
    date_played = models.DateTimeField(auto_now_add=True)
    details = models.TextField(null=True, blank=True)

    def __str__(self):
        return f'{self.player1} vs {self.player2} on {self.date_played.strftime("%Y-%m-%d %H:%M")}'
    
class Tournament(models.Model):
    name = models.CharField(max_length=100)
    creator = models.CharField(max_length=20, default='System')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length= 20, default='Upcoming') # Upcoming, Ongoing, Completed
    participants = models.ManyToManyField(Player, related_name='tournaments')

    def start_tournament(self):
        if self.participants.count() == 4:
            self.status = 'Ongoing'
            self.save()
            # additional logic to start tournament
        else:
            raise ValueError('Tournament must have 4 participants to start!')

    def __str__(self):
        return self.name

class TournamentMatch(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='matches_as_player1')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='matches_as_player2')
    winner = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, related_name='matches_won')
    scheduled_time = models.DateTimeField()
    match_round = models.PositiveIntegerField() # Indicates the round of the tournament this match belongs to

    MATCH_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('finals', 'Finals'),
    )
    status = models.CharField(max_length=12, choices=MATCH_STATUS_CHOICES, default='pending')

    def __str__(self):
        return f'{self.player1} vs {self.player2} in {self.tournament.name}'