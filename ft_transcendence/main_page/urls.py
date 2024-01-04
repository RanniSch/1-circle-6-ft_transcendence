from django.urls import path, include
from rest_framework import routers

from . import views
from .views import PlayerViewSet, GameViewSet, TournamentViewSet, TournamentGameViewSet

router = routers.DefaultRouter()
router.register(r'players', PlayerViewSet)
router.register(r'games', GameViewSet)
router.register(r'tournaments', TournamentViewSet)
router.register(r'tournamentgames', TournamentGameViewSet)

urlpatterns = [
    path('', views.main_page, name="main_page"),
    path('api/', include(router.urls)),
]