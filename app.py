from flask import Flask, render_template, redirect, session, request, Markup

from utils import *

app = Flask(__name__)
app.secret_key = "dtrytujet6rrt64"

###### work


###### work

###### event

@app.route('/eventD1', methods=['GET', 'POST'])
def eventD1():
    if not session['user_id']:
        return redirect('/welcome')
    if request.method == 'POST':
        code = request.form.get('code')
        if code.lower() == 'вахтёрша':
            return render_template('eventD1_1.html')
    return render_template('eventD1.html')

@app.route('/eventD1_2')
def eventD1_2():
    if not session['user_id']:
        return redirect('/welcome')
    inf = get_inform_db(session['user_id'])
    print(inf.day_events)
    if inf.day_events < 1:
        complite(session['user_id'], 4, 50, 50, "день 1")
    return render_template('eventD1_2.html', num=1)

@app.route('/eventD2')
def eventD2():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Нужно найти QR-код!"
    hint = "Подсказка: в колледже есть музей."
    return render_template('eventD2.html', title=title, hint=hint)

@app.route('/eventD2_1')
def eventD2_1():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Это только начало! Найти еще QR-код!"
    hint = "компьютерный класс, но не Б-корпусе."
    return render_template('eventD2.html', title=title, hint=hint)

@app.route('/eventD2_2')
def eventD2_2():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Еще чуть-чуть! Ты на верном пути!"
    hint = "Кабинет куратора 26-П."
    return render_template('eventD2.html', title=title, hint=hint)

@app.route('/eventD2_3')
def eventD2_3():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Финишная прямая. Найди последний QR-код!"
    hint = "смотри внимательно на расписание."
    return render_template('eventD2.html', title=title, hint=hint)

@app.route('/eventD2_4', methods=['GET', 'POST'])
def eventD2_4():
    if not session['user_id']:
        return redirect('/welcome')
    if request.method == 'POST':
        code = request.form.get('code')
        if code.lower() == 'ярлык':
            inf = get_inform_db(session['user_id'])
            if inf.day_events < 3:
                complite(session['user_id'], 4, 50, 50, "день 2")
            return render_template('eventD1_2.html', num=2) ##### END DAY
    return render_template('eventD2_1.html') ##### END DAY

@app.route('/eventD3')
def eventD3():
    if not session['user_id']:
        return redirect('/welcome')
    return render_template('eventD3.html')

@app.route('/eventD3_1')
def eventD3_1():
    if not session['user_id']:
        return redirect('/welcome')
    title = "QR-код!"
    hint = "Найти человек в Б-корпусе с QR-кодом на спине с 9:05 до 12:40."
    return render_template('eventD3_1.html', title=title, hint=hint)

@app.route('/eventD3_2', methods=['GET', 'POST'])
def eventD3_2():
    if not session['user_id']:
        return redirect('/welcome')
    if request.method == 'POST':
        code = request.form.get('code')
        if code.lower() == '175:7=25':
            inf = get_inform_db(session['user_id'])
            if inf.day_events < 4:
                complite(session['user_id'], 4, 50, 50, "день 3")
            return render_template('eventD1_2.html', num=3) ##### END DAY
    return render_template('eventD3_2.html')

@app.route('/eventD4')
def eventD4():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Нужно найти QR-код! Не опять, а снова!"
    hint = "Подсказка: Находится в кабинете, где присутствует половина группы 24-П (псс… это не б корпус!)"
    return render_template('eventD4.html', title=title, hint=hint)

@app.route('/eventD4_1')
def eventD4_1():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Предложение «Программист …»."
    hint = "Вам необходимо продолжить предложение преподавателю в кабинете, где учится 23-П в б-корпусе. "
    return render_template('eventD4.html', title=title, hint=hint)

@app.route('/eventD4_2')
def eventD4_2():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Подойдите к преподавателю в 36-б…"
    hint = ""
    return render_template('eventD4.html', title=title, hint=hint)

@app.route('/eventD4_3')
def eventD4_3():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Подойдите к преподавателю в 1-л…"
    hint = ""
    return render_template('eventD4.html', title=title, hint=hint)

@app.route('/eventD4_4')
def eventD4_4():
    if not session['user_id']:
        return redirect('/welcome')
    inf = get_inform_db(session['user_id'])
    if inf.day_events < 5:
        complite(session['user_id'], 4, 50, 50, "день 4")
    return render_template('eventD1_2.html', num=4) ######END DAY

@app.route('/eventD5')
def eventD5():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Найти QR-код на спинке лавочки в б-корпусе. "
    hint = ""
    return render_template('eventD5.html', title=title, hint=hint)

@app.route('/eventD5_1')
def eventD5_1():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Срочно!? Найти человек*! Вопрос жизни и смерти!?"
    hint = Markup("ФОТО ТИХОНА!!<br>он учится в 2…")
    return render_template('eventD5.html', title=title, hint=hint)

@app.route('/eventD5_2')
def eventD5_2():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Срочно!!! Найти еще 1 человека!!"
    hint = Markup("ФОТО Андрея!!<br>он учится в 2…")
    return render_template('eventD5.html', title=title, hint=hint)

@app.route('/eventD5_3')
def eventD5_3():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Срочно!!! Вроде как последний!?"
    hint = Markup("ФОТО Карена!!<br>он учится в 2…")
    return render_template('eventD5.html', title=title, hint=hint)

@app.route('/eventD5_4')
def eventD5_4():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Срочно!?! Это точно последний!! "
    hint = Markup("ФОТО Захара!!<br>он учится в акто…")
    return render_template('eventD5.html', title=title, hint=hint)

@app.route('/eventD5_5')
def eventD5_5():
    if not session['user_id']:
        return redirect('/welcome')
    title = "Ждем вас на мероприятии «Подведение итогов»! "
    hint = Markup("Будьте начеку, там явно будут халявные QR-коды на money.")
    inf = get_inform_db(session['user_id'])
    if inf.day_events < 6:
        complite(session['user_id'], 4, 50, 50, "день 5")
    return render_template('eventD5.html', title=title, hint=hint)

###### event


@app.route('/')
@app.route('/welcome')
def welcome():
    if session['user_id']:
        return redirect('/profile')
    return render_template('welcome.html',
        enter_url='https://oauth.vk.com/authorize?client_id=7982511&display=mobile&redirect_uri=https://bokon2014.pythonanywhere.com/aut&scope=offline&response_type=code&v=5.131')

@app.route('/profile')
def profile():
    if not session['user_id']:
        return redirect('/welcome')
    return render_template('profile.html',
        inform = get_inform_db(session['user_id']))

@app.route('/hashi')
def hashi():
    return render_template('hashi.html')

@app.route('/tops')
def tops():
    if not session['user_id']:
        return redirect('/welcome')
    return render_template('tops.html', inform=enumerate(get_inform_db_2()))

@app.route('/promo',methods=['GET', 'POST'])
def promo():
    if not session['user_id']:
        return redirect('/welcome')

    if request.method == 'POST':
        complite = check_promo(session['user_id'], request.form.get('code'))
        if complite:
            session['score'], session['money'], session['status'] = complite
            return redirect('/confirmation')
    return render_template('promo.html')

@app.route('/rules')
def rules():
    if not session['user_id']:
        return redirect('/welcome')
    return render_template('rules.html')

@app.route('/shop')
def shop():
    if not session['user_id']:
        return redirect('/profile')
    return render_template('shop.html', inform=get_prod(),
        user = get_inform_db(session['user_id']))

@app.route('/shop/<int:id>')
def shopby(id):
    if not session['user_id']:
        return redirect('/profile')
    confirm = by_shop(session['user_id'], id)
    return render_template('shop.html', inform=get_prod(), confirm=confirm,
        user = get_inform_db(session['user_id']), by=True)

@app.route('/task')
def task():
    if not session['user_id']:
        return redirect('/welcome')
    return render_template('task.html',
        tests = get_tests(),
        ETasks = get_ETasks(),
        control = get_dayControl()
        )

@app.route('/vote/<int:id>')
def addvote(id):
    if not session['user_id']:
        return redirect('/welcome')
    if not is_voted(session['user_id']).voted:
        add_vote(session['user_id'], id)
    return redirect('/vote')

@app.route('/vote')
def vote():
    if not session['user_id']:
        return redirect('/welcome')
    return render_template('votes.html',votes=get_votes(), is_voted=is_voted(session['user_id']))

@app.route('/tests/<int:id>', methods=['POST', 'GET'])
def tests(id):
    if not session['user_id']:
        return redirect('/welcome')
    inform = get_test(id)
    try:
        if session['user_id'] in map(int, inform.users.split(",")):
            return render_template('complited.html')
    except:
        pass
    if request.method == 'POST':
        complite = send_test(request.form, inform, session['user_id'])
        if complite:
            session['score'], session['money'], session['status'] = complite
            return redirect('/confirmation')
        else:
            return render_template('complited.html')
    return render_template('tests.html', inform=inform)

@app.route('/news')
def news():
    if not session['user_id']:
        return redirect('/welcome')
    return render_template('news.html', inform=get_news())


@app.route('/confirmation')
def confirmation():
    if not session['user_id']:
        return redirect('/welcome')
    return render_template('confirmation.html',
        money = session['money'],
        score = session['score'],
        type = session['status'])

@app.route('/qr')
def qr():
    if not session['user_id']:
        return redirect('/welcome')

    complite = check_promo(
        session['user_id'],
        request.args.get('code')
    )
    if complite:
        session['score'], session['money'], session['status'] = complite
        return redirect('/confirmation')
    return render_template('qr.html')

@app.route('/aut', methods=['GET', 'POST'])
def aut():
    code = request.args.get('code')
    session['user_id'] = login(code)
    return redirect('/profile')

#################### ADMIN:

@app.route('/admin/promos')
def promoslist():
    if not session['user_id'] or\
     not session['user_id'] in (236657896, 262708494, 246865308, 342894354):
        return redirect('/welcome')
    return render_template('promosList.html',
        inform=get_promo(),
        usertabl=get_users()
        )

@app.route('/admin')
def admin():
    if not session['user_id'] or\
     not session['user_id'] in (236657896, 262708494, 246865308, 342894354):
        return redirect('/welcome')
    return render_template('admin.html')

@app.route('/cart')
def cart():
    if not session['user_id'] or\
     not session['user_id'] in (236657896, 262708494, 246865308, 342894354):
        return redirect('/welcome')
    return render_template('cart.html',inform=enumerate(get_inform_db_2()))

@app.route('/addTest', methods=['POST'])
def addTest():
    add_Test(request.form)
    return redirect('/admin')

@app.route('/addVoter', methods=['POST'])
def addVoter():
    add_voter(request.form)
    return redirect('/admin')

@app.route('/addETask', methods=['POST'])
def addETask():
    add_ETask(request.form)
    return redirect('/admin')

@app.route('/addPromo', methods=['POST'])
def addPromo():
    add_promos(request.form)
    return redirect('/admin')

@app.route('/addProd', methods=['GET', 'POST'])
def addProd():
    add_prod(request.form)
    return redirect('/admin')

@app.route('/addNews', methods=['GET', 'POST'])
def addNews():
    add_news(request.form)
    return redirect('/admin')

@app.route('/addControlday', methods=['GET', 'POST'])
def addControlday():
    add_controlday(request.form)
    return redirect('/admin')
#################### HANDLER:

@app.errorhandler(KeyError)
def error(e):
    print(e)
    session['user_id'] = False
    return redirect('/welcome')

# @app.errorhandler(Exception)
# def error(e):
#     print(e)
#     session['user_id'] = False
#     return redirect('/welcome')

# @app.before_request
# def before_request():
#     session['user_id'] = 262708494
#     # session['user_id'] = 236657896

@app.before_first_request
def before_first_request():
    try:
        if not session['user_id']: pass
    except KeyError:
        session['user_id'] = False
