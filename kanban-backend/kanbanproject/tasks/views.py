
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Board
from .serializers import BoardSerializer
from .constants import BOARD_NOT_FOUND, BOARD_DELETED

# Create your views here.
@api_view(['GET', 'POST'])
def boards(request):    
    if request.method == 'GET':
        return list_boards()
    return create_board(request)

def list_boards():
    boards = Board.objects.values('id', 'name')
    serializer = BoardSerializer(boards, many=True)
    return Response(serializer.data)

def create_board(request):
    serializer = BoardSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
def board_detail(request, id):
    try:                
        board = Board.objects.get(pk=id)
    except Board.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND, data={'error': BOARD_NOT_FOUND})    
    
    if request.method == 'GET':
        serializer = BoardSerializer(board)
        return Response(serializer.data)
    if request.method == 'PATCH':
        serializer = BoardSerializer(board, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    board.delete()
    return Response(data={'msg': BOARD_DELETED}, status=status.HTTP_204_NO_CONTENT)
