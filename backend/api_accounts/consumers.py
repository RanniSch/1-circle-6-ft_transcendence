from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache

import json

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_session_id = self.scope['url_route']['kwargs']['game_session_id']
        self.room_group_name = 'pong_%s' % self.game_session_id

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        # add player to game session
        await self.add_player_to_game()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        # remove player from game session
        await self.remove_player_from_game()

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')

        if action == 'move_paddle':
            paddle_y = text_data_json.get('y')
            # update paddle position and check game state
            game_state = self.update_game_state(paddle_y)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_message',
                    'message': {
                        'action': 'update_game_state',
                        'game_state': game_state
                    }
                }
            )
        elif action == 'ready_for_matchmaking':
            # logic to add player to matchmaking queue
            pass

    async def game_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))

    async def add_player_to_game(self):
        # logic to add player to game session
        player_count = cache.incr(self.game_session_id, ignore_key_check=True)

        if self.both_players_connected(player_count):
            await self.start_game_for_both_players()
    
    async def remove_player_from_game(self):
        # logic to remove player from game session
        cache.decr(self.game_session_id, ignore_key_check=True)

    def both_players_connected(self, player_count):
        # logic to check if both players are in game session
        return player_count == 2

    async def start_game_for_both_players(self):
        # notify both players to start game
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_message',
                'message': {'action': 'start_game'}
            }
        )
    
    def update_game_state(self, paddle_y):
        # game logic (collision, scoring, etc.)
        return {
            'ballX': 0,
            'ballY': 0,
            'leftScore': 0,
            'rightScore': 0,
        }