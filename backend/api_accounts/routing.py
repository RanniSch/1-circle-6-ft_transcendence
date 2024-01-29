from django.urls import re_path

from .consumers import GameConsumer

websocket_urlpatterns = [
    re_path(r'ws/pong/(?P<game_session_id>\w+)/$', GameConsumer.as_asgi()),
]