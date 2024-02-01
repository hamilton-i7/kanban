from rest_framework import serializers
from django.core.validators import MaxLengthValidator

from .models import Board, Column, Task
from .constants import BOARD_NAME_MAX_LENGTH, BOARD_NAME_MAX_LENGTH_ERROR, COLUMN_NAME_MAX_LENGTH, COLUMN_NAME_MAX_LENGTH_ERROR, TASK_TITLE_MAX_LENGTH, TASK_TITLE_MAX_LENGTH_ERROR

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
        columns = Column.objects.filter(board=board)
        serializer = ColumnSerializer(columns, many=True)
        return serializer.data


class ColumnListSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        columns = [Column(board=self.context['board'], **item) for item in validated_data]
        return Column.objects.bulk_create(columns)

    def update(self, instance, validated_data):
        # Maps for id->instance and id->data item.        
        column_mapping: dict[int, Column] = {column.id: column for column in instance}
        data_mapping = {item['id']: item for item in validated_data if 'id' in item}

        for column_id, column in column_mapping.items():
            data = data_mapping.get(column_id)
            if data:
                column.name = data.get('name', column.name)
                column.save()
            else:
                column.delete()
                
        new_columns = [Column(board=self.context['board'], **item) for item in validated_data if 'id' not in item]
        Column.objects.bulk_create(new_columns)
        
        return instance


class ColumnSerializer(serializers.ModelSerializer):    
    id = serializers.IntegerField()
    name = serializers.CharField(
        validators=[MaxLengthValidator(limit_value=COLUMN_NAME_MAX_LENGTH, message=COLUMN_NAME_MAX_LENGTH_ERROR)]
    )

    class Meta:
        model = Column
        fields = ['id', 'name', 'created_at', 'last_modified']
        read_only_fields = ['board', 'created_at', 'last_modified']
        list_serializer_class = ColumnListSerializer

    def get_fields(self):
        fields = super().get_fields()

        if not self.instance:
            fields.pop('id', None)
        return fields


class TaskSerializer(serializers.ModelSerializer):    
    title = serializers.CharField(
        validators=[MaxLengthValidator(limit_value=TASK_TITLE_MAX_LENGTH, message=TASK_TITLE_MAX_LENGTH_ERROR)]
    )

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'column', 'created_at', 'last_modified']
        read_only_fields = ['created_at', 'last_modified']