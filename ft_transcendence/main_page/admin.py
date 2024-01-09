from django.contrib import admin

from .serializers import Player, Tournament

# Register your models here.

admin.site.register(Player)
admin.site.register(Tournament)