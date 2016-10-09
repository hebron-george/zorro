
"""
Tornado's responsible for handling the web interactions
"""
import requests
from bs4 import BeautifulSoup

site = 'http://infogob.com.pe/Politico/politico.aspx'
rowid_num = 0
nombres_num = 1
apellido_paterno_num = 2
apellido_materno_num = 3
class Tornado:
	def __init__(csvrow):
		self.rowid = csvrow[rowid_num]
		self.nombres = csvrow[nombres_num]
		self.apellido_materno = csvrow[apellido_materno_num]
		self.apellido_paterno = csvrow[apellido_paterno_num]

		# search the site for this person
