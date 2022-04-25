import qrcode
import xlsxwriter
import openpyxl
urls=[]

with open("codes","r",encoding="utf-8")as f:
    urls = [f"https://bokon2014.pythonanywhere.com/qr?code={i[:-1]}"for i in f.readlines()]
# print(urls)
# for  i in range(len(urls)):
#     qr = qrcode.QRCode(
#     version=1,
#     error_correction=qrcode.constants.ERROR_CORRECT_L,
#     box_size=10,
#     border=4)
#     qr.add_data(urls[i])
#     qr.make(fit=True)
#
#     img = qr.make_image(fill_color="black", back_color="white").resize((205,205))
#     img.save(f"./img/{i}.png")

# wb = openpyxl.load_workbook("test.xlsx")
# ws = wb.active
workbook   = xlsxwriter.Workbook('filename.xlsx')
worksheet1 = workbook.add_worksheet()
col = "A"
coll = 9
for i in range(len(urls)):
    if i == 20:
        col = "D"
        coll = ((i+1)*10)-1
    elif i == 40:
        col = "G"
        coll = ((i+1)*10)-1
    elif i == 60:
        col = "J"
        coll = ((i+1)*10)-1
    worksheet1.insert_image(f'{col}{((i+1)*10)-coll}', f"./img/{i}.png")
workbook.close()
#     img = openpyxl.drawing.image.Image(f"./img/{i}.png")
#     img.anchor = f'A{i}' # Or whatever cell location you want to use.
#     ws.add_image(img)
#     wb.save("test.xlsx")
