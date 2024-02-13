from django.urls import path
from . import views

urlpatterns = [
    path("boards/", views.boards, name="board-list"),
    path("boards/<int:id>/", views.board_detail, name="board-detail"),
    path("items/", views.create_task, name="task-list"),
    path("items/<int:id>/", views.task_detail, name="task-detail"),
    path("items/<int:id>/board/", views.get_related_board_by_task_id, name="board-by-task"),
    path("columns/<int:id>/", views.get_related_columns_by_column_id, name="related-column-list"),    
]