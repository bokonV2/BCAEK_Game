import requests

class Message():

    def __init__(self):
        self.tgConfig()

    def tgConfig(self):
        token = "5227710596:AAHdzxRy_1Dtkls2AVdmZzjWIsCu4GoOYUE"
        url = "https://api.telegram.org/bot"
        url += token
        self.method = url + "/sendMessage"

    def tgSend(self, text, log=False):
        if log: pass
        else: channel_id = "@bcaek_game"

        r = requests.post(self.method, data={
             "chat_id": channel_id,
             "text": text
              })


def send_telegram(text):
    token = "5227710596:AAHdzxRy_1Dtkls2AVdmZzjWIsCu4GoOYUE"
    url = "https://api.telegram.org/bot"
    channel_id = "@bcaek_game"
    url += token
    method = url + "/sendMessage"
    # r = requests.post(method, data={
    #      "chat_id": channel_id,
    #      "text": text
    #       })

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
  # send_telegram("hello world!")
  log = Message()
  log.tgSend("test")
