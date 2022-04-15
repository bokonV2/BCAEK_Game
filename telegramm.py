import requests

def send_telegram(text):
    token = "5227710596:AAHdzxRy_1Dtkls2AVdmZzjWIsCu4GoOYUE"
    url = "https://api.telegram.org/bot"
    channel_id = "@bcaek_game"
    url += token
    method = url + "/sendMessage"
    r = requests.post(method, data={
         "chat_id": channel_id,
         "text": text
          })

def send_telegram_log(text):
    token = "5227710596:AAHdzxRy_1Dtkls2AVdmZzjWIsCu4GoOYUE"
    url = "https://api.telegram.org/bot"
    channel_id = "@bcaek_game"
    url += token
    method = url + "/sendMessage"
    r = requests.post(method, data={
         "chat_id": channel_id,
         "text": text
          })

if __name__ == '__main__':
  send_telegram("hello world!")
