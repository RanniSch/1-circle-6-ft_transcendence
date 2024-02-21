from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

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
    path('change-password/', views.change_password, name='change_password'),
    path('match-history/', views.MatchHistoryListCreate.as_view(), name='match_history'),
    path('update-login-status/', views.update_login_status, name='update_login_status'),
    path('tournaments/create/', views.TournamentCreateView.as_view(), name='create_tournament'),
    path('tournaments/', views.TournamentListView.as_view(), name='list-tournaments'),
    path('tournaments/<int:pk>/', views.TournamentDetailView.as_view(), name='tournament-detail'),
    path('tournaments/<int:tournament_id>/join/', views.register_to_tournament, name='join-tournament'),
    path('tournaments/<int:tournament_id>/setup-final/', views.setup_final_match, name='setup_final'),
    path('matches/create/', views.TournamentMatchCreateView.as_view(), name='create_match'),
    path('matches/<int:pk>/', views.TournamentMatchDetailView.as_view(), name='match-detail'),
    path('matches/<int:pk>/update/', views.TournamentMatchUpdateView.as_view(), name='update_match'),
]