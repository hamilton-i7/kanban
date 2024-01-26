from rest_framework import serializers
from django.core.validators import MaxLengthValidator

from .models import Board
from .constants import BOARD_NAME_MAX_LENGTH, BOARD_NAME_MAX_LENGTH_ERROR


class BoardSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(validators=[MaxLengthValidator(limit_value=BOARD_NAME_MAX_LENGTH, message=BOARD_NAME_MAX_LENGTH_ERROR)])
    created_at = serializers.DateTimeField(read_only=True)
    last_modified = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        return Board.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.id = validated_data.get('id', instance.id)        
        instance.name = validated_data.get('name', instance.name)        
        instance.created_at = validated_data.get('created_at', instance.created_at)        
        instance.last_modified = validated_data.get('last_modified', instance.last_modified)        
        instance.save()
        return instance