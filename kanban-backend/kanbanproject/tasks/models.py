from django.db import models

from .constants import BOARD_NAME_MAX_LENGTH, COLUMN_NAME_MAX_LENGTH

# Create your models here.
class Board(models.Model):
    name = models.CharField(max_length=BOARD_NAME_MAX_LENGTH)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)


class Column(models.Model):
    name = models.CharField(max_length=COLUMN_NAME_MAX_LENGTH)
    board = models.ForeignKey(Board, related_name='columns', on_delete=models.CASCADE)
    position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)


class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    position = models.IntegerField(default=0)
    column = models.ForeignKey(Column, related_name='tasks', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)


class Subtask(models.Model):
    title = models.CharField(max_length=255)
    task = models.ForeignKey(Task, related_name='subtasks', on_delete=models.CASCADE)
    status = models.BooleanField(default=False)
    position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)