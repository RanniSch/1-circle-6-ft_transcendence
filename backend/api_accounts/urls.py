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
]