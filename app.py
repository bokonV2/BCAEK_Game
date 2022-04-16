from flask import Flask, render_template, redirect, session, request

from utils import *

app = Flask(__name__)
app.secret_key = "dtrytujet6rrt64"


@app.route('/')
@app.route('/welcome')
def welcome():
    if session['user_id']:
        return redirect('/profile')
    return render_template('welcome.html')

@app.route('/profile')
def profile():
    if not session['user_id']:
        return redirect('/welcome')
    return render_template('profile.html',
        inform = get_inform_db(session['user_id']))

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
    return render_template('shop.html', inform=get_prod())

@app.route('/task')
def task():
    if not session['user_id']:
        return redirect('/welcome')
    return render_template('task.html')

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
        request.args.get('code'),
        int(request.args.get('type'))
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
     not session['user_id'] in (236657896, 262708494):
        return redirect('/welcome')
    return render_template('promosList.html', inform=get_promo())

@app.route('/admin')
def admin():
    if not session['user_id'] or\
     not session['user_id'] in (236657896,262708494):
        return redirect('/welcome')
    return render_template('admin.html')

@app.route('/addPromo', methods=['GET', 'POST'])
def addPromo():
    add_promo(request.form)
    return redirect('/admin')

@app.route('/addProd', methods=['GET', 'POST'])
def addProd():
    add_prod(request.form)
    return redirect('/admin')

@app.route('/addNews', methods=['GET', 'POST'])
def addNews():
    add_news(request.form)
    return redirect('/admin')

#################### HANDLER:

@app.errorhandler(KeyError)
def error(e):
    print(e)
    session['user_id'] = False
    return redirect('/welcome')

@app.errorhandler(Exception)
def error(e):
    print(e)
    session['user_id'] = False
    return redirect('/welcome')

@app.before_request
def before_request():
    session['user_id'] = 262708494

@app.before_first_request
def before_first_request():
    try:
        if not session['user_id']: pass
    except KeyError:
        session['user_id'] = False
