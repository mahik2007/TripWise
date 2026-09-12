from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),
    path('signup/', views.signup),
    path('login/', views.login),
    path('forgot-password/', views.forgot_password),
    path('create-group/', views.create_group),
    path('group/<int:group_id>/', views.get_group_details),
    path('add-expense/', views.add_expense),
    path('balances/<int:group_id>/', views.balances),
    path('settle/<int:group_id>/', views.settle_up),
    path('contact/', views.contact),
    path('chatbot/', views.chatbot),
]