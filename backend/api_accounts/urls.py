from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views
from .views import GameSessionViewSet

game_session_list = GameSessionViewSet.as_view({'get': 'list', 'post': 'create'})
game_session_detail = GameSessionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})

urlpatterns = [
    path('register/', views.UserRegistration.as_view(), name='register'),
    path('login/', views.UserLogin.as_view(), name='login'),
    path('logout/', views.UserLogout.as_view(), name='logout'),
    path('profile/', views.UserProfile.as_view(), name='profile'),
    path('update-avatar/', views.update_avatar, name='update_avatar'),
    path('users/', views.UserView.as_view({'get': 'list'}), name='users'),
    path('authentication/', views.authenticated, name='authentication'),
    path('oauth/authorize/', views.OAuthAuthorize.as_view(), name='oauth_authorize'),
    path('oauth/callback/', views.OAuthCallback.as_view(), name='oauth_callback'),
    path('notifications/', views.UnreadNotifications.as_view(), name='unread_notifications'),
    path('mark-notifications-read/<int:notification_id>/', views.mark_notification_as_read, name='mark_notifications_read'),
    path('delete-account/', views.DeleteAccountView.as_view(), name='delete_account'),
    path('enable-2fa/', views.EnableTwoFactorAPIView.as_view(), name='enable_2fa'),
    path('verify-2fa/', views.VerifyTwoFactorAPIView.as_view(), name='verify_2fa'),
    path('update-stats/', views.update_stats, name='update_stats'),
    path('game-sessions/', game_session_list, name='game_session_list'),
    path('game-sessions/<int:pk>/', game_session_detail, name='game_session_detail'),
    path('find-match/', views.find_match, name='find_match'),
    path('change-password/', views.change_password, name='change_password'),
]