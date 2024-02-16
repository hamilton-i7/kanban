from rest_framework import serializers
from django.core.validators import MaxLengthValidator

from .models import Board, Column, Task, Subtask
from .constants import (
    BOARD_NAME_MAX_LENGTH, BOARD_NAME_MAX_LENGTH_ERROR,
    COLUMN_NAME_MAX_LENGTH, COLUMN_NAME_MAX_LENGTH_ERROR,
    TASK_TITLE_MAX_LENGTH, TASK_TITLE_MAX_LENGTH_ERROR,
    SUBTASK_NAME_MAX_LENGTH, SUBTASK_NAME_MAX_LENGTH_ERROR
)

class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class BoardSerializer(DynamicFieldsModelSerializer):    
    name = serializers.CharField(
        validators=[MaxLengthValidator(limit_value=BOARD_NAME_MAX_LENGTH, message=BOARD_NAME_MAX_LENGTH_ERROR)]
    )
    columns = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ['id', 'name', 'columns', 'created_at', 'last_modified']
        read_only_fields = ['created_at', 'last_modified']

    def get_columns(self, board):
        columns = Column.objects.filter(board=board).order_by('position')
        serializer = ColumnSerializer(columns, many=True)
        return serializer.data


class ColumnListSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        columns = [Column(board=self.context['board'], position=i, **item) for i, item in enumerate(validated_data)]
        return Column.objects.bulk_create(columns)

    def update(self, instance, validated_data):        
        column_mapping: dict[int, Column] = {column.id: column for column in instance}
        data_mapping = {item['id']: item for item in validated_data if 'id' in item}

        # Delete columns not found in new data
        for column_id, column in column_mapping.items():
            data = data_mapping.get(column_id)
            if not data:
                column.delete()
                
        new_columns = []
        for i, item in enumerate(validated_data):
            if 'id' in item:
                column = column_mapping.get(item['id'])
                if column is not None:
                    column.position = i
                    column.name = item.get('name', column.name)
                    column.save()
            else:
                new_columns.append(Column(board=self.context['board'], position=i, **item))
        
        Column.objects.bulk_create(new_columns)        
        return instance


class ColumnSerializer(DynamicFieldsModelSerializer):    
    id = serializers.IntegerField()
    name = serializers.CharField(
        validators=[MaxLengthValidator(limit_value=COLUMN_NAME_MAX_LENGTH, message=COLUMN_NAME_MAX_LENGTH_ERROR)]
    )
    tasks = serializers.SerializerMethodField()

    class Meta:
        model = Column
        fields = ['id', 'name', 'tasks', 'created_at', 'last_modified']
        read_only_fields = ['tasks', 'created_at', 'last_modified']
        list_serializer_class = ColumnListSerializer

    def get_fields(self):
        fields = super().get_fields()

        if not self.instance:
            fields.pop('id', None)
        return fields
    
    def get_tasks(self, column):
        tasks = Task.objects.filter(column=column)
        serializer = TaskSummarySerializer(tasks, many=True)
        return serializer.data


class ColumnReorderListSerializer(serializers.ListSerializer):
    def update(self, instance, validated_data):
        related_columns_map: dict[int, Column] = {column.id: column for column in instance}
        for i, item in enumerate(validated_data):
            column = related_columns_map.get(item['id'])
            if column:
                column.position = i
                column.save()
        return instance


class ColumnReorderSerializer(serializers.ModelSerializer):  
    id = serializers.IntegerField()

    class Meta:
        model = Column
        fields = ['id', 'position']
        read_only_fields = ['position']
        list_serializer_class = ColumnReorderListSerializer


class TaskSerializer(serializers.ModelSerializer):    
    title = serializers.CharField(
        validators=[MaxLengthValidator(limit_value=TASK_TITLE_MAX_LENGTH, message=TASK_TITLE_MAX_LENGTH_ERROR)]
    )
    subtasks = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'column', 'subtasks', 'created_at', 'last_modified']
        read_only_fields = ['created_at', 'last_modified']

    def get_subtasks(self, task):
        subtasks = Subtask.objects.filter(task=task)
        serializer = SubtaskSerializer(subtasks, many=True)
        return serializer.data


class TaskSummarySerializer(serializers.ModelSerializer):
    subtasks = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'subtasks']

    def get_subtasks(self, task):
        subtasks = Subtask.objects.filter(task=task)
        serializer = SubtaskSummarySerializer(subtasks, many=True)
        return serializer.data


class TaskReorderSerializer(serializers.ModelSerializer):
    position = serializers.IntegerField(min_value=0)    

    class Meta:
        model = Task
        fields = ['id', 'column', 'position']

    def update(self, instance, validated_data):
        current_column = instance.column
        target_column = Column.objects.prefetch_related('tasks').get(pk=validated_data['column'].pk)
        target_column_related_tasks = target_column.tasks.all().order_by('position')
        target_position = len(target_column_related_tasks) if validated_data['position'] > len(target_column_related_tasks) else validated_data['position']                
        if current_column.pk == target_column.pk:
            self.reorder_same_column(instance, target_column_related_tasks, target_position)
        else:
            self.reorder_different_columns(instance, current_column, target_column, target_column_related_tasks, target_position)
        return instance

    def reorder_same_column(self, instance, related_tasks, position):
        filtered_column_tasks = [current_task for current_task in related_tasks if current_task.pk != instance.pk]
        target_column_tasks = filtered_column_tasks[:position] + [instance] + filtered_column_tasks[position:]        
        for i, task in enumerate(target_column_tasks):
            task.position = i            
        Task.objects.bulk_update(target_column_tasks, ['position'])        

    def reorder_different_columns(self, instance, column_from: Column, column_to: Column, related_tasks, position):
        current_column_tasks = Task.objects.filter(column=column_from).order_by('position')
        filtered_column_tasks = [current_task for current_task in current_column_tasks if current_task.pk != instance.pk]
        target_column_tasks = related_tasks[:position] + [instance] + related_tasks[position:]

        # Reassign positions to the remaining tasks from the original column
        for i, task in enumerate(filtered_column_tasks):
            task.position = i
        Task.objects.bulk_update(filtered_column_tasks, ['position'])

        for i, task in enumerate(target_column_tasks):
            task.position = i
        Task.objects.bulk_update(target_column_tasks, ['position'])

        # Update the task's column to belong to the target column
        instance.column = column_to
        instance.save()


class SubtaskListSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        subtasks = [Subtask(task=self.context['task'], **item) for item in validated_data]
        return Subtask.objects.bulk_create(subtasks)

    def update(self, instance, validated_data):
        # Maps for id->instance and id->data item.        
        subtask_mapping: dict[int, Subtask] = {subtask.id: subtask for subtask in instance}
        data_mapping = {item['id']: item for item in validated_data if 'id' in item}

        for subtask_id, subtask in subtask_mapping.items():
            data = data_mapping.get(subtask_id)
            if data:
                subtask.title = data.get('title', subtask.title)
                subtask.status = data.get('status', subtask.status)
                subtask.save()
            else:
                subtask.delete()
                
        new_subtasks = [Subtask(task=self.context['task'], **item) for item in validated_data if 'id' not in item]
        Subtask.objects.bulk_create(new_subtasks)
        
        return instance


class SubtaskSerializer(serializers.ModelSerializer):    
    id = serializers.IntegerField()
    title = serializers.CharField(
        validators=[MaxLengthValidator(limit_value=SUBTASK_NAME_MAX_LENGTH, message=SUBTASK_NAME_MAX_LENGTH_ERROR)]
    )

    class Meta:
        model = Subtask
        fields = ['id', 'title', 'status', 'created_at', 'last_modified']
        read_only_fields = ['task', 'created_at', 'last_modified']
        list_serializer_class = SubtaskListSerializer

    def get_fields(self):
        fields = super().get_fields()

        if not self.instance:
            fields.pop('id', None)
        return fields


class SubtaskSummarySerializer(serializers.ModelSerializer):    
    class Meta:
        model = Subtask
        fields = ['id', 'title', 'status']
