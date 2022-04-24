import requests
import random

from models import *
from telegramm import *

VKAPI = "https://api.vk.com/method/"
TOKEN = "d7c5eedbd7c5eedbd7c5eedb78d7bc2374dd7c5d7c5eedbb6b621e2c23bae2ed0b42552"
V = 5.131
VKTOKEN = f"&access_token={TOKEN}&v={V}"

client_id = 7982511
client_secret = "NhpZrbytODiMUN2obpbv"
redirect_uri = "https://bokon2014.pythonanywhere.com/aut"
symb=tuple('--abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')


def add_controlday(form):
    otv = []
    for i in range(1, 7):
        otv.append(form.get(f"day{i}"))
    otv = list(map(lambda x: False if x == None else True, otv))
    control = get_dayControl()
    control.day1 = otv[0]
    control.day2 = otv[1]
    control.day3 = otv[2]
    control.day4 = otv[3]
    control.day5 = otv[4]
    control.golos = otv[5]
    control.save()

def get_dayControl():
    return DayControl.select().where(DayControl.id == 1).get()

def get_tests():
    return Tests.select()

def get_test(id):
    return Tests.select().where(Tests.id == id).get()

def send_test(form, tests, user_id):
    otv = []
    for i in range(1, len(tests.otvets.split("<>"))+1):
        otv.append(form.get(str(i)))
    otv = "".join(list(map(lambda x: "0" if x == None else "1", otv)))
    if otv == tests.COtvets:
        if tests.users == None:
            tests.users = user_id
        else:
            tests.users = f"{tests.users},{user_id}"
        tests.save()
        complite(user_id, 3, tests.score, tests.money, tests.id)
        return tests.score, tests.money, True
    else:
        if tests.users == None:
            tests.users = user_id
        else:
            tests.users = f"{tests.users},{user_id}"
        tests.save()
        return False

def genPromo(length=9):
    return ''.join([random.choice(symb) for x in range(length)])

def add_ETask(form):
    ETasks.create(**form)

def is_voted(id):
    return Users.select(Users.voted).where(Users.vk_id == id).get()

def get_votes():
    return Votes.select(Votes,Users.name,Users.lastname,Users.image,Users.voted).join(
        Users, on = (Votes.user_id == Users.vk_id)
    )

def add_vote(user_id, id):
    vote = Votes.select().where(Votes.id == id).get()
    vote.count += 1
    user = Users.select().where(Users.vk_id == user_id).get()
    user.voted = True
    vote.save()
    user.save()

def get_users():
    return Users.select()

def add_voter(form):
    Votes.create(**form)

def get_ETasks():
    return ETasks.select()

def add_Test(form):
    form=form.to_dict()
    otvets = form['otvets'].split("\r\n")
    form['otvets']='<>'.join(otvets)
    Tests.create(**form)

def add_promo(count, code, score, money, type, description, loop=0):
    prom = Promo(
        promo = code, score = score,
        money = money, description = description,
        type = type, loop=loop
    )
    prom.save()
    send_telegram_log(f'LOG:\nНовый промо №{prom.id}\n{code}\n{score}:{money}\n{description}\nloop:{loop}')

def add_promos(form):
    count = int(form.get("count"))
    count = 1 if count<=0 else count

    if count==1:
        add_promo(**form)
    else:
        form=form.to_dict()
        for i in range(count):
            form["code"] = genPromo()
            add_promo(**form)

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
    send_telegram_log(f'LOG:\nДобавлена новость\n{form.get("title")}\n{form.get("description")}')

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

def by_shop(user_id, id):
    prod = Products.select().where(Products.id == id).get()
    user = Users.select().where(Users.vk_id == user_id).get()

    if user.money < prod.cost:
        return False

    user.products = f"{user.products},{id}"
    user.money -= prod.cost
    user.save()
    return True

def check_promo(user_id, code):
    try:
        promo = Promo.get(promo=code)
        if promo.user_id != None and promo.loop == 0:
            type = 6
            complite(user_id, type, promo.score, promo.money, promo)
            return (promo.score * -0.5, promo.money * -0.5, False)

        promo.user_id = user_id
        promo.save()
        complite(user_id, promo.type, promo.score, promo.money, promo)
        return (promo.score, promo.money, True)
    except DoesNotExist:
        return False

def complite(user_id, id, score, money, promo):
    user = Users.select().where(Users.vk_id == user_id).get()
    user.score += score
    user.money += money
    if id == 0: # tinyQR
        user.tinyQR += 1
        send_telegram_log(f"LOG:\n{user.name} {user.lastname} актив sml промо  №{promo.id} {promo.promo} {promo.description}")
    elif id == 1: # mediumQR
        user.mediumQR += 1
        send_telegram_log(f"LOG:\n{user.name} {user.lastname} актив med промо  №{promo.id} {promo.promo} {promo.description}")
    elif id == 2: # bigQG
        user.bigQG += 1
        send_telegram_log(f"LOG:\n{user.name} {user.lastname} актив big промо  №{promo.id} {promo.promo} {promo.description}")
    elif id == 3: # day_task
        user.day_task += 1
        send_telegram_log(f"LOG:\n{user.name} {user.lastname} Выполнил задание №{promo}")
    elif id == 4: # day_events
        user.day_events += 1
        send_telegram_log(f"LOG:\n{user.name} {user.lastname} Завершил {promo}")
    elif id == 5: # promo
        user.promo += 1
        send_telegram_log(f"LOG:\n{user.name} {user.lastname} Активировал код {promo.promo} ({promo.description})")
    elif id == 6: # lost
        user.lost_score -= score * 0.5
        user.lost_money -= money * 0.5
        user.score -= score * 1.5
        user.money -= money * 1.5
    user.save()

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
            money = 50,
            score = 50
        )
        send_telegram_log(f"LOG:\n{last_name} {first_name}: {user_id}, зарегался")
        return user_id

# if __name__ == '__main__':
