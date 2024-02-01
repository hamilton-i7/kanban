
from functools import partial
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Board, Column, Task
from .serializers import BoardSerializer, ColumnSerializer, TaskSerializer
from .constants import BOARD_NOT_FOUND, BOARD_DELETED, TASK_NOT_FOUND, TASK_DELETED

# Create your views here.
@api_view(['GET', 'POST'])
def boards(request):    
    if request.method == 'GET':
        return get_boards()
    return create_board(request.data)

def get_boards():
    boards = Board.objects.all()
    serializer = BoardSerializer(boards, many=True, fields=('id', 'name'))
    return Response(serializer.data)

def create_board(data):
    serializer = BoardSerializer(data=data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    board = serializer.save()    
    columns_data = data.get('columns', [])
    columns_serializer = ColumnSerializer(data=columns_data, many=True, context={'board': board})

    if not columns_serializer.is_valid():
        board.delete()
        return Response(columns_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    columns_serializer.save()

    board_with_columns = Board.objects.prefetch_related('columns').get(pk=board.id)
    board_serializer = BoardSerializer(board_with_columns)

    return Response(board_serializer.data, status=status.HTTP_201_CREATED)
    
@api_view(['GET', 'PATCH', 'DELETE'])
def board_detail(request, id: int):
    try:                
        board = Board.objects.get(pk=id)
    except Board.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND, data={'error': BOARD_NOT_FOUND})    
    
    if request.method == 'GET':
        return get_board(board)
    if request.method == 'PATCH':
        return update_board(board, request.data)
    return delete_board(board)

def get_board(board: Board):
    board_with_columns = Board.objects.prefetch_related('columns').get(pk=board.id)    
    serializer = BoardSerializer(board_with_columns)
    return Response(serializer.data)

def update_board(board: Board, data):
    serializer = BoardSerializer(board, data=data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    serializer.save()

    old_columns = Column.objects.filter(board=board.id)
    columns_data = data.get('columns', [])
    columns_serializer = ColumnSerializer(old_columns, data=columns_data, many=True, partial=True, context={'board': board})

    if not columns_serializer.is_valid():        
        return Response(columns_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    columns_serializer.save()            
    
    board_with_columns = Board.objects.prefetch_related('columns').get(pk=board.id)
    board_serializer = BoardSerializer(board_with_columns)

    return Response(board_serializer.data, status=status.HTTP_200_OK)

def delete_board(board: Board):
    board.delete()
    return Response(data={'msg': BOARD_DELETED}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def create_task(request):    
    serializer = TaskSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    serializer.save()
    return Response(data=serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PATCH', 'DELETE'])
def task_detail(request, id: int):
    try:                
        task = Task.objects.get(pk=id)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND, data={'error': TASK_NOT_FOUND})
    
    if request.method == 'GET':
        return get_task(task)
    if request.method == 'PATCH':
        return update_task(task, request.data)
    return delete_task(task)

def get_task(task: Task):    
    serializer = TaskSerializer(task)
    return Response(serializer.data)

def update_task(task: Task, data):
    serializer = TaskSerializer(task, data=data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)

def delete_task(task: Task):
    task.delete()
    return Response(data={'msg': TASK_DELETED}, status=status.HTTP_204_NO_CONTENT)