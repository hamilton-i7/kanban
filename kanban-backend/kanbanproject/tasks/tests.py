from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.exceptions import ValidationError

from .models import Board, Column
from .serializers import BoardSerializer, ColumnSerializer
from .constants import BOARD_NAME_MAX_LENGTH_ERROR, BOARD_NOT_FOUND, BOARD_DELETED, COLUMN_NAME_MAX_LENGTH_ERROR

# Create your tests here.
class BoardAPITests(APITestCase):
    def test_board_name_too_long(self):
        data = {'name': 'A' * (Board._meta.get_field('name').max_length + 1)}
        serializer = BoardSerializer(data=data)        
        
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertEqual(context.exception.detail['name'][0], BOARD_NAME_MAX_LENGTH_ERROR)

    def test_create_board_name_too_long(self):        
        client = APIClient()
        data = {'name': 'A' * (Board._meta.get_field('name').max_length + 1)}
        response = client.post('/tasks/boards/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['name'][0], BOARD_NAME_MAX_LENGTH_ERROR)

    def test_board_name_blank(self):
        data = {'name': '     '}
        serializer = BoardSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_create_board_name_blank(self):
        client = APIClient()
        data = {'name': '     '}
        response = client.post('/tasks/boards/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_board_name_null(self):
        data = {'age': 23}
        serializer = BoardSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_create_board_name_null(self):
        client = APIClient()
        data = {'age': 23}
        response = client.post('/tasks/boards/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_board_success(self):
        client = APIClient()        
        data = {'name': 'Test Board'}
        response = client.post('/tasks/boards/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED) 
        self.assertIn('name', response.data)
        self.assertEqual(response.data['name'], data['name']) 

        # Assert the board is actually stored in the database
        created_board = Board.objects.get(id=response.data['id']) 
        self.assertEqual(created_board.name, data['name'])

    def test_read_only_field_post(self):
        client = APIClient()        
        data = {'name': 'Sample Board', 'created_at': timezone.now() + timedelta(days=2)}        
        response = client.post(f'/tasks/boards/', data=data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], data['name'])
        self.assertNotEqual(response.data['created_at'], data['created_at'])

    def test_column_name_too_long(self):
        data = {'name': 'A' * (Column._meta.get_field('name').max_length + 1)}
        serializer = ColumnSerializer(data=data)        
        
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertEqual(context.exception.detail['name'][0], COLUMN_NAME_MAX_LENGTH_ERROR)

    def test_create_board_with_columns_name_too_long(self):
        client = APIClient()
        data = {
            'name': 'Test Board',
            'columns': [
                {'name': 'A' * (Board._meta.get_field('name').max_length + 1)},
                {'name': 'Column 2'},
            ]
        }        
        response = client.post('/tasks/boards/', data=data, format='json')                
                
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0]['name'][0], COLUMN_NAME_MAX_LENGTH_ERROR)  

    def test_column_name_blank(self):
        data = {'name': '    '}
        serializer = ColumnSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_create_board_with_columns_name_blank(self):
        client = APIClient()
        data = {
            'name': 'Test Board',
            'columns': [
                {'name': '   '},
                {'name': 'Column 2'},
            ]
        }        
        response = client.post('/tasks/boards/', data=data, format='json')                
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_column_name_null(self):
        data = {'age': 23}
        serializer = ColumnSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_create_board_with_columns_name_null(self):
        client = APIClient()
        data = {
            'name': 'Test Board',
            'columns': [
                {'age': 23},
                {'name': 'Column 2'},
            ]
        }        
        response = client.post('/tasks/boards/', data=data, format='json')                
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_board_with_columns_success(self):
        client = APIClient()
        data = {
            'name': 'Test Board',
            'columns': [
                {'name': 'Column 1'},
                {'name': 'Column 2'},
            ]
        }
        response = client.post('/tasks/boards/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('name', response.data)
        self.assertEqual(response.data['name'], data['name'])

        columns = Column.objects.filter(board=response.data['id'])
        self.assertIn('columns', response.data)
        self.assertEqual(len(columns), len(data['columns']))

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
        """
        Assert the retrieved board is displaying all the necessary data.
        """
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        response = client.get(f'/tasks/boards/{board.id}/')

        self.assertEqual(response.data['name'], board.name)
        self.assertEqual(response.data['id'], board.id)
        self.assertIn('created_at', response.data)
        self.assertIn('last_modified', response.data)

    def test_get_board_with_columns(self):        
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        response = client.get(f'/tasks/boards/{board.id}/')

        self.assertEqual(response.data['name'], board.name)
        self.assertEqual(response.data['id'], board.id)
        self.assertIn('created_at', response.data)
        self.assertIn('last_modified', response.data)

        for i, column in enumerate(columns):
            self.assertEqual(response.data['columns'][i]['id'], column.id)
            self.assertEqual(response.data['columns'][i]['name'], column.name)            

    def test_get_board_not_found(self):
        client = APIClient()
        response = client.get('/tasks/boards/0/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], BOARD_NOT_FOUND)

    def test_update_board_not_found(self):
        client = APIClient()
        response = client.patch('/tasks/boards/0/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], BOARD_NOT_FOUND)

    def test_name_length_exceeded_patch(self):
        board = Board.objects.create(name='Sample Board')
        data = {'name': 'A' * (Board._meta.get_field('name').max_length + 1)}
        serializer = BoardSerializer(data=data)
        response = self.client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')
        
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertEqual(context.exception.detail['name'][0], BOARD_NAME_MAX_LENGTH_ERROR)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_name_blank_patch(self):
        board = Board.objects.create(name='Sample Board')
        data = {'name': '     '}
        serializer = BoardSerializer(data=data)
        response = self.client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_name_null_patch(self):
        board = Board.objects.create(name='Sample Board')
        data = {'age': 23}        
        response = self.client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')
                
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_read_only_field_patch(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        data = {'created_at': timezone.now() + timedelta(days=2)}        
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data['created_at'], data['created_at'])

    def test_update_board(self):
        client = APIClient()        
        board = Board.objects.create(name='Sample Board')
        data = {'name': 'Test Board'}
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])

    def test_delete_board_not_found(self):
        client = APIClient()
        response = client.delete('/tasks/boards/0/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], BOARD_NOT_FOUND)

    def test_delete_board_success(self):
        client = APIClient()
        board_1 = Board.objects.create(name='Sample Board 1')
        board_2 = Board.objects.create(name='Sample Board 2')
        response = client.delete(f'/tasks/boards/{board_1.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data['msg'], BOARD_DELETED)
        with self.assertRaises(Board.DoesNotExist):
            Board.objects.get(id=board_1.id)

        created_board = Board.objects.get(id=board_2.id)
        self.assertEqual(created_board.id, board_2.id) 
        