from django.views.decorators.http import require_http_methods

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Board
from .serializers import BoardSerializer

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