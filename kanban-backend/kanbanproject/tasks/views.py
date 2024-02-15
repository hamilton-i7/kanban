from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Board, Column, Task, Subtask
from .serializers import BoardSerializer, ColumnSerializer, ColumnReorderSerializer, TaskSerializer, SubtaskSerializer
from .constants import BOARD_NOT_FOUND, BOARD_DELETED, TASK_NOT_FOUND, TASK_DELETED, COLUMN_NOT_FOUND

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
def board_detail(request, id):    
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
    detailed_board = Board.objects.prefetch_related('columns__tasks__subtasks').get(pk=board.id)
    serializer = BoardSerializer(detailed_board)
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
    
    task = serializer.save()
    subtasks_data = request.data.get('subtasks', [])
    subtasks_serializer = SubtaskSerializer(data=subtasks_data, many=True, context={'task': task})

    if not subtasks_serializer.is_valid():
        task.delete()
        return Response(subtasks_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    subtasks_serializer.save()

    task_with_subtasks = Task.objects.prefetch_related('subtasks').get(pk=task.id)
    task_serializer = TaskSerializer(task_with_subtasks)
    return Response(data=task_serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PATCH', 'DELETE'])
def task_detail(request, id):
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

    old_subtasks = Subtask.objects.filter(task=task.id)
    subtasks_data = data.get('subtasks', [])
    subtasks_serializer = SubtaskSerializer(old_subtasks, data=subtasks_data, many=True, partial=True, context={'task': task})

    if not subtasks_serializer.is_valid():        
        return Response(subtasks_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    subtasks_serializer.save()            
    
    task_with_subtasks = Task.objects.prefetch_related('subtasks').get(pk=task.id)
    task_serializer = TaskSerializer(task_with_subtasks)
    return Response(task_serializer.data, status=status.HTTP_200_OK)

def delete_task(task: Task):
    task.delete()
    return Response(data={'msg': TASK_DELETED}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def get_related_columns_by_column_id(_, id):
    try:                
        column = Column.objects.get(pk=id)
    except Column.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND, data={'error': COLUMN_NOT_FOUND})
    
    columns = Column.objects.filter(board=column.board)
    serializer = ColumnSerializer(columns, many=True, fields=('id', 'name'))
    return Response(serializer.data)

@api_view(['GET'])
def get_related_board_by_task_id(_, id):
    try:                
        task = Task.objects.get(pk=id)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND, data={'error': TASK_NOT_FOUND})
    
    column = Column.objects.get(pk=task.column.pk)
    board = Board.objects.get(pk=column.board.pk)
    return get_board(board)

@api_view(['PATCH'])
def reorder_columns(request, id): 
    try:                
        board = Board.objects.get(pk=id)
    except Board.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND, data={'error': BOARD_NOT_FOUND})    
    
    related_columns = Column.objects.filter(board=board.id)
    columns_serializer = ColumnReorderSerializer(related_columns, data=request.data, many=True)

    if not columns_serializer.is_valid():        
        return Response(columns_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    columns_serializer.save()
    return Response(columns_serializer.data)