#!/usr/bin/env python

import sys
import re
from bs4 import BeautifulSoup

class Extractor:

  def __init__(self):
    pass

  def extract(self, html):
    bsobj = BeautifulSoup(html, 'lxml')
    text = ''
    for pobj in bsobj.findAll([
      'p','span','h1','h2','h3','h4','h5','h6','ul','ol','li',
      'article','section'
      ]):
      t = pobj.get_text()
      t = t.strip()
      t = re.sub('\n+', " ", t)
      t = re.sub('\r+', " ", t)
      t = re.sub('\t+', " ", t)
      t = re.sub(' +', " ", t)
      t = t.encode('utf-8')
      t = t.decode('ascii', 'ignore')
      text += t + ' '
    return text

if __name__ == '__main__':
  if len(sys.argv) <= 1:
    print 'usage: %s <file>' % sys.argv[0]
    exit(1)

  extractor = Extractor()
  with open(sys.argv[1], 'r') as f:
    html = f.read()
    print extractor.extract(html) 
