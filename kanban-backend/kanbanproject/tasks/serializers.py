from rest_framework import serializers
from django.core.validators import MaxLengthValidator

from .models import Board, Column
from .constants import BOARD_NAME_MAX_LENGTH, BOARD_NAME_MAX_LENGTH_ERROR, COLUMN_NAME_MAX_LENGTH, COLUMN_NAME_MAX_LENGTH_ERROR

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
        read_only_fields = ['id', 'created_at', 'last_modified']

    def get_columns(self, board):
        columns = Column.objects.filter(board=board)
        serializer = ColumnSerializer(columns, many=True)
        return serializer.data


class ColumnSerializer(serializers.ModelSerializer):    
    name = serializers.CharField(
        validators=[MaxLengthValidator(limit_value=COLUMN_NAME_MAX_LENGTH, message=COLUMN_NAME_MAX_LENGTH_ERROR)]
    )    

    class Meta:
        model = Column
        fields = ['id', 'name', 'created_at', 'last_modified']
        read_only_fields = ['id', 'created_at', 'last_modified']

    def create(self, validated_data):
        board = self.context['board']
        column = Column.objects.create(board=board, **validated_data)
        return column