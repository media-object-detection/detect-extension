# 텍스트 삽입 관련 코드

from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2
import os

# 이미지 열기
image = Image.open(r'D:\opendoor.jpg')

# 이미지에 텍스트 추가
draw = ImageDraw.Draw(image)
font_path = 'D:\\NanumSquareRoundR.ttf'
font = ImageFont.truetype(font=font_path, size=textImgSize)
draw.text((10, 10), text, fill=(255, 255, 255), font=font)

# 덮어씌울 부분 잘라내기
width, height = overlay_image.size
cropped_overlay = overlay_image.crop((0, 0, width, height))

# 원본 이미지에 덮어씌우기
original_image.paste(cropped_overlay, (x, y))

# 이미지를 OpenCV 배열로 변환
image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

# 이미지 띄우기
cv2.imshow('image', image_cv)
cv2.waitKey(0)
cv2.destroyAllWindows()