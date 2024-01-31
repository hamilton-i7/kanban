
from functools import partial
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Board, Column
from .serializers import BoardSerializer, ColumnSerializer
from .constants import BOARD_NOT_FOUND, BOARD_DELETED

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
            
    columns_with_ID = [column for column in columns_data if 'id' in column]
    # columns_without_ID = [column for column in columns_data if 'id' not in column]

    # If there's a matching ID: update column
    # columns_to_create = []
    # for column in columns_with_ID:
    #     column_to_update = next((old_column for old_column in old_columns if old_column.id == column['id']), None)        
    #     if column_to_update:
    #         column_to_update.name = column['name']
    #     else:
    #         # If ID's don't match: create column
    #         columns_to_create.append(Column(name=column['name']))
    # Column.objects.bulk_update(old_columns, fields=['name'])
    
    # If there's no ID: create column
    # columns_to_create += [Column(name=column['name']) for column in columns_without_ID]
    # Column.objects.bulk_create(columns_to_create + columns_to_create)

    # If a column is not found in the new list, delete it
    columns_to_delete = [old_column.id for old_column in old_columns if not next((column for column in columns_with_ID if column['id'] == old_column.id), None)]    
    Column.objects.filter(id__in=columns_to_delete).delete()
    
    board_with_columns = Board.objects.prefetch_related('columns').get(pk=board.id)
    board_serializer = BoardSerializer(board_with_columns)

    return Response(board_serializer.data, status=status.HTTP_200_OK)

def delete_board(board: Board):
    board.delete()
    return Response(data={'msg': BOARD_DELETED}, status=status.HTTP_204_NO_CONTENT)