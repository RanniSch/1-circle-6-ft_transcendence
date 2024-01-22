from django.contrib import admin

from .models import Player

from .serializers import RegisterSerializer

# Register your models here.

admin.site.register(Player)