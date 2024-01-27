from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.exceptions import ValidationError, APIException

from .models import Board
from .serializers import BoardSerializer
from .constants import BOARD_NAME_MAX_LENGTH_ERROR, BOARD_NOT_FOUND

# Create your tests here.
class BoardAPITests(APITestCase):
    def test_name_length_exceeded(self):
        data = {'name': 'A' * (Board._meta.get_field('name').max_length + 1)}
        serializer = BoardSerializer(data=data)
        response = self.client.post('/tasks/boards/', data=data, format='json')                     
        
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertEqual(context.exception.detail['name'][0], BOARD_NAME_MAX_LENGTH_ERROR)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_name_blank(self):
        data = {'name': '     '}
        serializer = BoardSerializer(data=data)
        response = self.client.post('/tasks/boards/', data=data, format='json')                     
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_name_null(self):
        data = {'age': 23}
        serializer = BoardSerializer(data=data)
        response = self.client.post('/tasks/boards/', data=data, format='json')                     
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_board(self):
        client = APIClient()        
        data = {'name': 'Test Board'}
        response = client.post('/tasks/boards/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED) 
        self.assertIn('name', response.data)
        self.assertEqual(response.data['name'], data['name']) 

        created_board = Board.objects.get(id=response.data['id']) 
        self.assertEqual(created_board.name, data['name'])

    def test_list_boards(self):
        client = APIClient()
        response = client.get('/tasks/boards/', format='json')        

        self.assertTrue(not response.data)

        Board.objects.create(name='Board Test 1')
        Board.objects.create(name='Board Test 2')

        response = client.get('/tasks/boards/', format='json')
        self.assertEqual(len(response.data), 2)

        """
        Assert only the necessary fields are being sent.
        """
        self.assertIn('name', response.data[0])
        self.assertIn('id', response.data[0])
        self.assertNotIn('created_at', response.data[0])

    def test_get_board_success(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        response = client.get(f'/tasks/boards/{board.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)        

    def test_get_board_success_fields(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        response = client.get(f'/tasks/boards/{board.id}/')

        self.assertEqual(response.data['name'], board.name)
        self.assertEqual(response.data['id'], board.id)
        self.assertIn('created_at', response.data)
        self.assertIn('last_modified', response.data)

    def test_get_board_not_found(self):
        client = APIClient()
        response = client.get('/tasks/boards/0/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], BOARD_NOT_FOUND)