from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, Group, Permission
from django.contrib.auth.base_user import BaseUserManager

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

    profile_avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='avatars/default_avatar.jpg')
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=75, unique=True)
    username = models.CharField(max_length=25, unique=True, null=True, blank=True)
    games_played = models.PositiveIntegerField(default=0)
    games_won = models.PositiveIntegerField(default=0)
    games_lost = models.PositiveIntegerField(default=0)
    games_tied = models.PositiveIntegerField(default=0)
    date_joined = models.DateTimeField(auto_now_add=True)
    custom_title = models.CharField(max_length=75, null=True, blank=True)

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