from django.urls import path
from . import views

urlpatterns = [
    path("boards/", views.boards, name="board-list"),
    path("boards/<int:id>/", views.board_detail, name="board-detail")
]