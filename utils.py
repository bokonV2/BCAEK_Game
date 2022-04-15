import requests

from models import *
from telegramm import *

VKAPI = "https://api.vk.com/method/"
TOKEN = "d7c5eedbd7c5eedbd7c5eedb78d7bc2374dd7c5d7c5eedbb6b621e2c23bae2ed0b42552"
V = 5.131
VKTOKEN = f"&access_token={TOKEN}&v={V}"

client_id = 7982511
client_secret = "NhpZrbytODiMUN2obpbv"
redirect_uri = "https://6954-178-168-218-53.ngrok.io/aut"

def add_promo(form):
    Promo.create(
        promo = form.get("code"), score = form.get("score"),
        money = form.get("money"), description = form.get("description")
    )
    send_telegram_log(f'LOG:\nНовый промо\n{form.get("code")}\n{form.get("score")}:{form.get("money")}\n{form.get("description")}')

def add_prod(form):
    Products.create(
        name = form.get("name"), cost = form.get("cost"),
        section = form.get("section"), description = form.get("description")
    )
    send_telegram_log(f'LOG:\nНовый продукт\n{form.get("name")}:{form.get("cost")}\nраздел:{form.get("section")}\n{form.get("description")}')

def add_news(form):
    News.create(
        title = form.get("title"), description = form.get("description")
    )
    send_telegram_log(f'LOG:\nНовая новость\n{form.get("title")}\n{form.get("description")}')

def get_promo():
    return Promo.select().order_by(Promo.id.desc()).dicts()

def get_news():
    return News.select().order_by(News.id.desc())

def get_prod():
    return Products.select().order_by(Products.id.desc())

def get_inform_db(user_id):
    return Users.select().where(Users.vk_id == user_id).get()

def get_inform_db_2():
    return Users.select().order_by(Users.score.desc()).dicts()

def check_promo(user_id, code, type=5):
    try:
        promo = Promo.get(promo=code)
        if promo.user_id != None:
            type = 6
            complite(user_id, type, promo.score, promo.money, promo)
            return (promo.score * -0.5, promo.money * -0.5, False)

        promo.user_id = user_id
        promo.save()
        complite(user_id, type, promo.score, promo.money, promo)
        return (promo.score, promo.money, True)
    except DoesNotExist:
        return False

def complite(user_id, id, score, money, promo):
    user = Users.select().where(Users.vk_id == user_id).get()
    user.score += score
    user.money += money
    if id == 0: # tinyQR
        user.tinyQR += 1
    elif id == 1: # mediumQR
        user.mediumQR += 1
    elif id == 2: # bigQG
        user.bigQG += 1
    elif id == 3: # day_task
        user.day_task += 1
    elif id == 4: # day_events
        user.day_events += 1
    elif id == 5: # promo
        user.promo += 1
    elif id == 6: # lost
        user.lost_score -= score * 0.5
        user.lost_money -= money * 0.5
        user.score -= score * 1.5
        user.money -= money * 1.5
    user.save()
    send_telegram_log(f"LOG:\n{user.name} {user.lastname} Активировал код {promo.promo} ({promo.description})")

def get_user_id(code):
    response = requests.get(f'https://oauth.vk.com/access_token?client_id={client_id}&client_secret={client_secret}&redirect_uri={redirect_uri}&code={code}')
    user_id = response.json().get("user_id")
    return user_id

def get_information(user_id):
    response = requests.get(f"{VKAPI}users.get?lang=ru&user_ids={user_id}&fields=photo_200&access_token={TOKEN}&v={V}")# get information
    resp = response.json()['response'][0]
    first_name = resp.get("first_name")
    last_name = resp.get("last_name")
    photo_200 = resp.get("photo_200")
    return (user_id, first_name, last_name, photo_200)

def login(code):
    DB = []
    users = Users.select()
    for i in users:
        DB.append(i.vk_id)
    user_id = get_user_id(code)
    if user_id in DB:
        return user_id
    else:
        user_id, first_name, last_name, photo_200 = get_information(user_id)
        Users.create(
            vk_id = user_id,
            name = first_name,
            lastname = last_name,
            image = photo_200,
        )
        send_telegram_log(f"LOG:\n{last_name} {first_name}: {user_id}, зарегался")
        return user_id

# if __name__ == '__main__':
