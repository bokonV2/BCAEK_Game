import datetime
from peewee import *

db = SqliteDatabase('my_app.db')

class BaseModel(Model):
    class Meta:
        database = db


class Users(BaseModel):
    vk_id = IntegerField(unique=True)
    name = CharField()
    lastname = CharField()
    image = CharField()
    score = IntegerField()
    money = IntegerField()
    tinyQR = IntegerField()
    mediumQR = IntegerField()
    bigQG = IntegerField()
    day_task = IntegerField()
    day_events = IntegerField()
    promo = IntegerField()
    lost_score = IntegerField()
    lost_money = IntegerField()
    products = TextField()


class Promo(BaseModel):
    promo = CharField()
    score = IntegerField()
    money = IntegerField()
    type = IntegerField()
    description = TextField()
    user_id = IntegerField()


class News(BaseModel):
    title = TextField()
    description = TextField()


class Products(BaseModel):
    name = TextField()
    cost = IntegerField()
    section = IntegerField()
    description = TextField()


if __name__ == '__main__':
    Users.create_table()
    Promo.create_table()
    News.create_table()
    Products.create_table()
