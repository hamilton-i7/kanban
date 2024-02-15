from calendar import c
from datetime import timedelta
from turtle import position
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.exceptions import ValidationError

from .models import Board, Column, Task, Subtask
from .serializers import BoardSerializer, ColumnSerializer, ColumnReorderSerializer, TaskSerializer, SubtaskSerializer
from .constants import (
    BOARD_NAME_MAX_LENGTH_ERROR, BOARD_NOT_FOUND, BOARD_DELETED,
    COLUMN_NAME_MAX_LENGTH_ERROR,
    TASK_TITLE_MAX_LENGTH_ERROR, TASK_NOT_FOUND, TASK_DELETED,
    SUBTASK_NAME_MAX_LENGTH_ERROR
)

# Create your tests here.
class BoardAPITests(APITestCase):
    def test_board_name_too_long(self):
        data = {'name': 'A' * (Board._meta.get_field('name').max_length + 1)}
        serializer = BoardSerializer(data=data)        
        
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertEqual(context.exception.detail['name'][0], BOARD_NAME_MAX_LENGTH_ERROR)

    def test_board_name_blank(self):
        data = {'name': '     '}
        serializer = BoardSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_board_name_null(self):
        data = {'age': 23}
        serializer = BoardSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_create_board_name_too_long(self):
        client = APIClient()
        data = {'name': 'A' * (Board._meta.get_field('name').max_length + 1)}
        response = client.post('/tasks/boards/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['name'][0], BOARD_NAME_MAX_LENGTH_ERROR)

    def test_create_board_name_null(self):
        client = APIClient()
        data = {'age': 23}
        response = client.post('/tasks/boards/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_board_name_blank(self):
        client = APIClient()
        data = {'name': '     '}
        response = client.post('/tasks/boards/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_board_read_only_field(self):
        client = APIClient()        
        data = {'name': 'Sample Board', 'created_at': timezone.now() + timedelta(days=2)}        
        response = client.post(f'/tasks/boards/', data=data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], data['name'])
        self.assertNotEqual(response.data['created_at'], data['created_at'])

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

    def test_column_name_too_long(self):
        data = {'name': 'A' * (Column._meta.get_field('name').max_length + 1)}
        serializer = ColumnSerializer(data=data)        
        
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertEqual(context.exception.detail['name'][0], COLUMN_NAME_MAX_LENGTH_ERROR)

    def test_column_name_blank(self):
        data = {'name': '    '}
        serializer = ColumnSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_column_name_null(self):
        data = {'age': 23}
        serializer = ColumnSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_reorder_columns_invalid(self):
        data = [
            {'id': 'George'},
            {'id': True},
        ]
        serializer = ColumnReorderSerializer(data=data, many=True)
        
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)        
        self.assertIn('id', context.exception.detail[0])
        self.assertIn('id', context.exception.detail[1])     

    def test_update_reorder_columns_invalid(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        data = [
            {'id': 'George'},
            {'id': True},
        ]
        response = client.patch(f'/tasks/boards/{board.pk}/columns/reorder/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('id', response.data[0])
        self.assertIn('id', response.data[1])  

    def test_reorder_columns_id_missing(self):
        data = [
            {'name': 'George'},
            {'age': 23},
        ]
        serializer = ColumnReorderSerializer(data=data, many=True)
        
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)                
        self.assertIn('id', context.exception.detail[0])
        self.assertIn('id', context.exception.detail[1])

    def test_update_reorder_columns_id_missing(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        data = [
            {'name': 'George'},
            {'age': 23},
        ]
        response = client.patch(f'/tasks/boards/{board.pk}/columns/reorder/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('id', response.data[0])
        self.assertIn('id', response.data[1])

    def test_reorder_columns_success(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board),
                Column(name='Column 3', board=board),
                Column(name='Column 4', board=board),
            ]
        )
        data = [
            {'id': columns[1].pk},
            {'id': columns[3].pk},
            {'id': columns[0].pk},
            {'id': columns[2].pk},
        ]
        response = client.patch(f'/tasks/boards/{board.pk}/columns/reorder/', data=data, format='json')
        ordered_columns = Column.objects.filter(board=board.pk).order_by('position')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for i, column in enumerate(ordered_columns):
            self.assertEqual(column.position, i)
            self.assertEqual(data[i]['id'], column.pk)        

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

        columns = Column.objects.filter(board=response.data['id']).order_by('position')
        self.assertIn('columns', response.data)
        self.assertEqual(len(columns), len(data['columns']))

        for i, column in enumerate(columns):
            self.assertEqual(column.name, data['columns'][i]['name'])

    def test_get_boards(self):
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

    def test_get_board_not_found(self):
        client = APIClient()
        response = client.get('/tasks/boards/0/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], BOARD_NOT_FOUND)

    def test_get_board_success(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        response = client.get(f'/tasks/boards/{board.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_board_success_fields(self):
        """
        Assert the retrieved board is displaying only the necessary data.
        """
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])
        subtasks = Subtask.objects.bulk_create([
            Subtask(title='Subtask 1', task=task),
            Subtask(title='Subtask 2', status=True, task=task),
        ])
        response = client.get(f'/tasks/boards/{board.id}/')

        self.assertEqual(response.data['id'], board.id)
        self.assertEqual(response.data['name'], board.name)
        self.assertIn('created_at', response.data)
        self.assertIn('last_modified', response.data)
        
        self.assertNotIn('board', response.data['columns'][0])

        for i, column in enumerate(columns):
            self.assertEqual(response.data['columns'][i]['id'], column.id)
            self.assertEqual(response.data['columns'][i]['name'], column.name)
        
        self.assertEqual(response.data['columns'][0]['tasks'][0]['title'], task.title)
        self.assertNotIn('description', response.data['columns'][0]['tasks'][0])
        self.assertNotIn('column', response.data['columns'][0]['tasks'][0])
        self.assertNotIn('created_at', response.data['columns'][0]['tasks'][0])
        self.assertNotIn('last_modified', response.data['columns'][0]['tasks'][0])

        self.assertNotIn('task', response.data['columns'][0]['tasks'][0]['subtasks'][0])
        self.assertNotIn('created_at', response.data['columns'][0]['tasks'][0]['subtasks'][0])
        self.assertNotIn('last_modified', response.data['columns'][0]['tasks'][0]['subtasks'][0])

        for i, subtask in enumerate(subtasks):
            self.assertEqual(response.data['columns'][0]['tasks'][0]['subtasks'][i]['id'], subtask.id)
            self.assertEqual(response.data['columns'][0]['tasks'][0]['subtasks'][i]['title'], subtask.title)

    def test_get_board_with_columns(self):        
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board, position=0),
                Column(name='Column 2', board=board, position=1)
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
            self.assertEqual(column.position, i)

    def test_update_board_name_too_long(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        data = {'name': 'A' * (Board._meta.get_field('name').max_length + 1)}        
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['name'][0], BOARD_NAME_MAX_LENGTH_ERROR)

    def test_update_board_name_blank(self):
        client = APIClient()                
        board = Board.objects.create(name='Sample Board')
        data = {'name': '     '}        
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')
                
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_board_name_null(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        data = {'age': 23}
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_board_read_only_field(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        data = {'created_at': timezone.now() + timedelta(days=2)}        
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data['created_at'], data['created_at'])

    def test_update_board_not_found(self):
        client = APIClient()
        response = client.patch('/tasks/boards/0/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], BOARD_NOT_FOUND)

    def test_update_board_success(self):
        client = APIClient()        
        board = Board.objects.create(name='Sample Board')
        data = {'name': 'Test Board'}
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])

    def test_update_board_with_columns_name_too_long(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        data = {            
            'columns': [
                {'name': 'A' * (Board._meta.get_field('name').max_length + 1)},
                {'name': 'Column 2'},
            ]
        }        
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')                
                
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0]['name'][0], COLUMN_NAME_MAX_LENGTH_ERROR)

    def test_update_board_with_columns_name_blank(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        data = {            
            'columns': [
                {'name': '   '},
                {'name': 'Column 2'},
            ]
        }        
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')                
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_board_with_columns_name_null(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        data = {            
            'columns': [
                {'age': 23},
                {'name': 'Column 2'},
            ]
        }        
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')                
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_board_with_columns_success(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create([
            Column(name='Column 1', board=board),
            Column(name='Column 2', board=board)
        ])
        data = {
            'name': 'Test Board',
            'columns': [
                {'id': columns[0].id, 'name': 'New Column 1'},
                {'id': columns[1].id, 'name': 'New Column 2'},
            ]
        }
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('name', response.data)
        self.assertEqual(response.data['name'], data['name'])

        related_columns = Column.objects.filter(board=response.data['id'])
        
        self.assertIn('columns', response.data)
        for index, column in enumerate(related_columns):
            self.assertEqual(column.id, data['columns'][index]['id'])
            self.assertEqual(column.name, data['columns'][index]['name'])

    def test_update_board_new_columns(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        data = {
            'name': 'Test Board',
            'columns': [
                {'name': 'New Column 1'},
                {'name': 'New Column 2'},
            ]
        }

        columns = Column.objects.all()
        self.assertTrue(not columns)

        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('name', response.data)
        self.assertEqual(response.data['name'], data['name'])

        related_columns = Column.objects.filter(board=response.data['id'])
        self.assertIn('columns', response.data)
        
        for index, column in enumerate(related_columns):
            self.assertEqual(column.name, data['columns'][index]['name'])

    def test_update_board_new_and_existing_columns(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create([
            Column(name='Column 1', board=board),
            Column(name='Column 2', board=board)
        ])
        data = {
            'name': 'Test Board',
            'columns': [
                {'id': columns[0].id, 'name': 'New Column 1'},
                {'name': 'New Column 3'},
                {'id': columns[1].id, 'name': 'New Column 2'},
            ]
        }

        columns = Column.objects.filter(board=board.pk)
        
        # Assert the board originally had 2 columns
        self.assertEqual(len(columns), len([column for column in data['columns'] if 'id' in column]))

        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('name', response.data)
        self.assertEqual(response.data['name'], data['name'])

        related_columns = Column.objects.filter(board=response.data['id']).order_by('position')

        self.assertIn('columns', response.data)
        
        for index, column in enumerate(related_columns):
            if 'id' in data['columns']:
                self.assertEqual(column.id, data['columns'][index]['id'])
            self.assertEqual(column.name, data['columns'][index]['name'])
            self.assertEqual(column.position, index)

        # Assert the response is sending the columns in the right order
        for index, column in enumerate(response.data['columns']):
            self.assertEqual(column['name'], data['columns'][index]['name'])

    def test_update_board_non_existing_columns(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create([
            Column(name='Column 1', board=board),
            Column(name='Column 2', board=board)
        ])
        data = {
            'name': 'Test Board',
            'columns': [
                {'id': columns[0].id, 'name': 'New Column 1'},
                {'id': columns[1].id, 'name': 'New Column 2'},
                {'id': 2_000}
            ]
        }
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')        

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('name', response.data)
        self.assertEqual(response.data['name'], data['name'])

        related_columns = Column.objects.filter(board=response.data['id'])

        self.assertIn('columns', response.data)
        
        for index, column in enumerate(related_columns):            
            self.assertEqual(column.id, data['columns'][index]['id'])
            self.assertEqual(column.name, data['columns'][index]['name'])

    def test_update_board_existing_columns_no_name(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create([
            Column(name='Column 1', board=board),
            Column(name='Column 2', board=board)
        ])
        data = {
            'name': 'Test Board',
            'columns': [
                {'id': columns[0].id, 'name': 'New Column 1'},
                {'id': columns[1].id},                
            ]
        }
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')        

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('name', response.data)
        self.assertEqual(response.data['name'], data['name'])

        related_columns = Column.objects.filter(board=response.data['id'])

        self.assertIn('columns', response.data)
        
        for index, column in enumerate(related_columns):            
            self.assertEqual(column.id, data['columns'][index]['id'])
            self.assertEqual(column.name, data['columns'][index].get('name', columns[index].name))

    def test_update_board_removed_columns(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        Column.objects.bulk_create([
            Column(name='Column 1', board=board),
            Column(name='Column 2', board=board)
        ])
        data = {'name': 'Test Board'}
        response = client.patch(f'/tasks/boards/{board.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('name', response.data)
        self.assertEqual(response.data['name'], data['name'])

        related_columns = Column.objects.filter(board=response.data['id'])
        
        self.assertIn('columns', response.data)
        self.assertTrue(not related_columns)

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

    def test_task_title_too_long(self):
        data = {'title': 'A' * (Task._meta.get_field('title').max_length + 1)}
        serializer = TaskSerializer(data=data)        
        
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertEqual(context.exception.detail['title'][0], TASK_TITLE_MAX_LENGTH_ERROR)

    def test_task_title_blank(self):
        data = {'title': '     '}
        serializer = TaskSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_task_required_fields_missing(self):
        data = {'description': 'This is a description.'}
        serializer = TaskSerializer(data=data)
        
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)        
        self.assertIn('title', context.exception.detail)
        self.assertIn('column', context.exception.detail)

    def test_create_task_title_too_long(self):
        client = APIClient()
        data = {'title': 'A' * (Task._meta.get_field('title').max_length + 1)}
        response = client.post('/tasks/items/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['title'][0], TASK_TITLE_MAX_LENGTH_ERROR)

    def test_create_task_required_fields_missing(self):
        client = APIClient()
        data = {'description': 'This is a description.'}
        response = client.post('/tasks/items/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)
        self.assertIn('column', response.data)

    def test_create_task_title_blank(self):
        client = APIClient()
        data = {'title': '     '}
        response = client.post('/tasks/items/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_task_success(self):
        client = APIClient()        
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        data = {'title': 'Sample Task', 'column': columns[0].id}
        response = client.post('/tasks/items/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED) 
        self.assertIn('title', response.data)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['column'], data['column'])

    def test_update_task_title_too_long(self):
        client = APIClient()
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', description='This is a task description.', column=columns[0])
        data = {'title': 'A' * (Task._meta.get_field('title').max_length + 1)}
        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['title'][0], TASK_TITLE_MAX_LENGTH_ERROR)

    def test_update_task_title_blank(self):
        client = APIClient()
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', description='This is a task description.', column=columns[0])
        data = {'title': '     '}
        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_task_not_found(self):
        client = APIClient()
        response = client.patch('/tasks/items/0/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], TASK_NOT_FOUND)

    def test_update_task_success(self):
        client = APIClient()        
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])
        data = {'column': columns[1].id, 'description': 'New description.'}
        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)         
        self.assertEqual(response.data['description'], data['description'])
        self.assertEqual(response.data['column'], data['column'])

    def test_get_task_not_found(self):
        client = APIClient()
        response = client.get('/tasks/items/0/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], TASK_NOT_FOUND)

    def test_get_task_success(self):
        client = APIClient()
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])
        response = client.get(f'/tasks/items/{task.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], task.id)        
        self.assertEqual(response.data['title'], task.title)
        self.assertEqual(response.data['description'], task.description)

    def test_delete_task_not_found(self):
        client = APIClient()
        response = client.delete('/tasks/items/0/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], TASK_NOT_FOUND)

    def test_delete_task_success(self):
        client = APIClient()
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task_1 = Task.objects.create(title='Sample Task 1', column=columns[0])
        task_2 = Task.objects.create(title='Sample Task 2', column=columns[1])
        
        response = client.delete(f'/tasks/items/{task_1.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data['msg'], TASK_DELETED)
        with self.assertRaises(Task.DoesNotExist):
            Task.objects.get(id=task_1.id)

        created_task = Task.objects.get(id=task_2.id)
        self.assertEqual(created_task.id, task_2.id)

    def test_subtask_title_too_long(self):
        data = {'title': 'A' * (Subtask._meta.get_field('title').max_length + 1)}
        serializer = SubtaskSerializer(data=data)        
        
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertEqual(context.exception.detail['title'][0], SUBTASK_NAME_MAX_LENGTH_ERROR)

    def test_subtask_title_blank(self):
        data = {'title': '    '}
        serializer = SubtaskSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_subtask_title_null(self):
        data = {'age': 23}
        serializer = SubtaskSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_subtask_status_invalid(self):
        data = {'status': "Subtask's status"}
        serializer = SubtaskSerializer(data=data)        
        
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_create_task_with_subtasks_title_too_long(self):
        client = APIClient()
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        data = {
            'title': 'Sample Task',
            'column': columns[0].id,
            'subtasks': [
                {'title': 'A' * (Subtask._meta.get_field('title').max_length + 1)},
                {'title': 'Subtask 2'},
            ]
        }        
        response = client.post('/tasks/items/', data=data, format='json')                
                
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0]['title'][0], SUBTASK_NAME_MAX_LENGTH_ERROR)

    def test_create_task_with_subtasks_title_blank(self):
        client = APIClient()
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        data = {
            'title': 'Sample Task',
            'column': columns[0].id,
            'subtasks': [
                {'title': '    '},
                {'title': 'Subtask 2', 'status': True},
            ]
        }        
        response = client.post('/tasks/items/', data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_task_with_subtasks_title_null(self):
        client = APIClient()
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        data = {
            'title': 'Sample Task',
            'column': columns[0].id,
            'subtasks': [
                {'age': 23},
                {'title': 'Subtask 2', 'status': True},
            ]
        }        
        response = client.post('/tasks/items/', data=data, format='json')              
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_task_with_subtasks_success(self):
        client = APIClient()
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        data = {
            'title': 'Sample Task',
            'column': columns[0].id,
            'subtasks': [
                {'title': 'Subtask 1'},
                {'title': 'Subtask 2', 'status': True},
            ]
        }        
        response = client.post('/tasks/items/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('title', response.data)
        self.assertEqual(response.data['title'], data['title'])

        subtasks = Subtask.objects.filter(task=response.data['id'])
        self.assertIn('subtasks', response.data)
        self.assertEqual(len(subtasks), len(data['subtasks']))

    def test_get_task_with_subtasks(self):        
        client = APIClient()
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])
        subtasks = Subtask.objects.bulk_create([
            Subtask(title='Subtask 1', task=task),
            Subtask(title='Subtask 2', status=True, task=task),
        ])
        response = client.get(f'/tasks/items/{task.id}/')

        self.assertEqual(response.data['id'], task.id)
        self.assertEqual(response.data['title'], task.title)        

        for i, subtask in enumerate(subtasks):
            self.assertEqual(response.data['subtasks'][i]['id'], subtask.id)
            self.assertEqual(response.data['subtasks'][i]['title'], subtask.title)

    def test_update_task_with_subtasks_name_too_long(self):
        client = APIClient()
        board = Board.objects.create(name='Test Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])        
        data = {            
            'subtasks': [
                {'title': 'A' * (Task._meta.get_field('title').max_length + 1)},
                {'title': 'SUbtask 2'},
            ]
        }        
        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')                
                
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0]['title'][0], SUBTASK_NAME_MAX_LENGTH_ERROR)

    def test_update_task_with_subtasks_name_blank(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])     
        data = {            
            'subtasks': [
                {'title': '   '},
                {'title': 'Subtask 2'},
            ]
        }        
        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')                
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_task_with_subtasks_name_null(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])     
        data = {            
            'subtasks': [
                {'age': 23},
                {'title': 'Subtask 2'},
            ]
        }        
        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')                
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_task_with_subtasks_success(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])
        subtasks = Subtask.objects.bulk_create([
            Subtask(title='Subtask 1', task=task),
            Subtask(title='Subtask 2', status=True, task=task),
        ])
        data = {
            'title': 'Updated Task Title',
            'subtasks': [
                {'id': subtasks[0].id, 'title': 'New Subtask 1'},
                {'id': subtasks[1].id, 'title': 'New Subtask 2'},
            ]
        }
        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)        
        self.assertEqual(response.data['title'], data['title'])

        related_subtasks = Subtask.objects.filter(task=response.data['id'])
        
        self.assertIn('subtasks', response.data)
        for index, subtask in enumerate(related_subtasks):
            self.assertEqual(subtask.id, data['subtasks'][index]['id'])
            self.assertEqual(subtask.title, data['subtasks'][index]['title'])

    def test_update_task_new_subtasks(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])
        data = {
            'title': 'Updated Task Title',
            'subtasks': [
                {'title': 'New Subtask 1'},
                {'title': 'New Subtask 2'},
            ]
        }

        subtasks = Subtask.objects.all()
        self.assertTrue(not subtasks)

        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('title', response.data)
        self.assertEqual(response.data['title'], data['title'])

        related_subtasks = Subtask.objects.filter(task=response.data['id'])
        self.assertIn('subtasks', response.data)
        
        for index, subtask in enumerate(related_subtasks):
            self.assertEqual(subtask.title, data['subtasks'][index]['title'])

    def test_update_task_new_and_existing_subtasks(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])
        subtasks = Subtask.objects.bulk_create([
            Subtask(title='Subtask 1', task=task),
            Subtask(title='Subtask 2', status=True, task=task),
        ])
        data = {
            'title': 'Updated Task Title',
            'subtasks': [
                {'id': subtasks[0].id, 'title': 'New Subtask 1'},
                {'id': subtasks[1].id, 'title': 'New Subtask 2'},
                {'title': 'New Subtask 3'},
            ]
        }

        subtasks = Subtask.objects.filter(task=task.pk)
        
        # Assert the task originally had 2 subtasks
        self.assertEqual(len(subtasks), len([subtask for subtask in data['subtasks'] if 'id' in subtask]))

        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('title', response.data)
        self.assertEqual(response.data['title'], data['title'])

        related_subtasks = Subtask.objects.filter(task=response.data['id'])

        self.assertIn('subtasks', response.data)
        
        for index, subtask in enumerate(related_subtasks):
            if 'id' in data['subtasks']:
                self.assertEqual(subtask.id, data['subtasks'][index]['id'])
            self.assertEqual(subtask.title, data['subtasks'][index]['title'])

    def test_update_task_non_existing_subtasks(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])
        subtasks = Subtask.objects.bulk_create([
            Subtask(title='Subtask 1', task=task),
            Subtask(title='Subtask 2', status=True, task=task),
        ])
        data = {
            'title': 'Updated Task Title',
            'subtasks': [
                {'id': subtasks[0].id, 'title': 'New Subtask 1'},
                {'id': subtasks[1].id, 'title': 'New Subtask 2'},
                {'id': 2_000}
            ]
        }
        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')        

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('title', response.data)
        self.assertEqual(response.data['title'], data['title'])

        related_subtasks = Subtask.objects.filter(task=response.data['id'])

        self.assertIn('subtasks', response.data)
        
        for index, subtask in enumerate(related_subtasks):            
            self.assertEqual(subtask.id, data['subtasks'][index]['id'])
            self.assertEqual(subtask.title, data['subtasks'][index]['title'])

    def test_update_task_existing_subtasks_no_name(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])
        subtasks = Subtask.objects.bulk_create([
            Subtask(title='Subtask 1', task=task),
            Subtask(title='Subtask 2', status=True, task=task),
        ])
        data = {
            'title': 'Updated Task Title',
            'subtasks': [
                {'id': subtasks[0].id, 'title': 'New Subtask 1'},
                {'id': subtasks[1].id},                
            ]
        }
        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')        

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('title', response.data)
        self.assertEqual(response.data['title'], data['title'])

        related_subtasks = Subtask.objects.filter(task=response.data['id'])

        self.assertIn('subtasks', response.data)
        
        for index, subtask in enumerate(related_subtasks):            
            self.assertEqual(subtask.id, data['subtasks'][index]['id'])
            self.assertEqual(subtask.title, data['subtasks'][index].get('title', subtasks[index].title))

    def test_update_task_removed_subtasks(self):
        client = APIClient()
        board = Board.objects.create(name='Sample Board')
        columns = Column.objects.bulk_create(
            [
                Column(name='Column 1', board=board),
                Column(name='Column 2', board=board)
            ]
        )
        task = Task.objects.create(title='Sample Task', column=columns[0])
        subtasks = Subtask.objects.bulk_create([
            Subtask(title='Subtask 1', task=task),
            Subtask(title='Subtask 2', status=True, task=task),
        ])
        data = {'title': 'Updated Task Title'}
        response = client.patch(f'/tasks/items/{task.id}/', data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('title', response.data)
        self.assertEqual(response.data['title'], data['title'])

        related_subtasks = Subtask.objects.filter(task=response.data['id'])
        
        self.assertIn('subtasks', response.data)
        self.assertTrue(not related_subtasks)