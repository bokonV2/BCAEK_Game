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
    voted = BooleanField()

class Promo(BaseModel):
    promo = CharField()
    score = IntegerField()
    money = IntegerField()
    type = IntegerField()
    description = TextField()
    user_id = IntegerField()
    loop = BooleanField()


class News(BaseModel):
    title = TextField()
    description = TextField()


class Products(BaseModel):
    name = TextField()
    cost = IntegerField()
    section = IntegerField()
    description = TextField()


class Tests(BaseModel):
    quest = TextField()
    otvets = TextField()
    COtvets = TextField()
    score = IntegerField()
    money = IntegerField()
    users = TextField()


class ETasks(BaseModel):
    name = TextField()


class Votes(BaseModel):
    user_id = IntegerField()
    text = TextField()
    count = IntegerField()


class DayControl(BaseModel):
    day1 = BooleanField(default=False)
    day2 = BooleanField(default=False)
    day3 = BooleanField(default=False)
    day4 = BooleanField(default=False)
    day5 = BooleanField(default=False)

if __name__ == '__main__':
    Users.create_table()
    Promo.create_table()
    News.create_table()
    Products.create_table()
    Tests.create_table()
    ETasks.create_table()
    Votes.create_table()
    DayControl.create_table()
